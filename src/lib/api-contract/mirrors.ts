import { z } from 'zod';

export const legacyMirrorStatusSchema = z.enum([
  'succeeded',
  'syncing',
  'pending',
  'failed',
  'paused',
  'cached',
  'unknown',
]);

const localizedTextSchema = z
  .object({
    zh: z.string().optional(),
    en: z.string().optional(),
  })
  .refine(
    (value) => value.zh || value.en,
    'at least one translation is required'
  );

export const legacyMirrorSchema = z.object({
  id: z.string().min(1),
  url: z.string().min(1),
  name: localizedTextSchema,
  desc: localizedTextSchema,
  upstream: z.string(),
  size: z.number().nonnegative(),
  status: legacyMirrorStatusSchema,
  lastAttempt: z.number(),
  nextScheduled: z.number(),
  lastFailure: z.number(),
  lastSuccess: z.number(),
  files: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      })
    )
    .optional(),
});

export const mirrorStateSchema = z.enum([
  'ready',
  'syncing',
  'pending',
  'failed',
  'paused',
  'cached',
  'unknown',
]);

export const frontendMirrorSchema = z.object({
  id: z.string().min(1),
  displayName: z.object({ zh: z.string(), en: z.string() }),
  description: z.object({ zh: z.string(), en: z.string() }),
  dataUrl: z.url(),
  upstream: z.string(),
  mode: z.enum(['sync', 'cache', 'unknown']),
  state: mirrorStateSchema,
  sizeBytes: z.number().nonnegative(),
  lastAttemptAt: z.iso.datetime().nullable(),
  lastSucceededAt: z.iso.datetime().nullable(),
  lastFailedAt: z.iso.datetime().nullable(),
  nextScheduledAt: z.iso.datetime().nullable(),
  documentation: z.object({
    id: z.string().nullable(),
    available: z.boolean(),
  }),
});

export const frontendMirrorsResponseSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: z.iso.datetime(),
  items: z.array(frontendMirrorSchema),
});

export type LegacyMirror = z.infer<typeof legacyMirrorSchema>;
export type FrontendMirror = z.infer<typeof frontendMirrorSchema>;
export type FrontendMirrorsResponse = z.infer<
  typeof frontendMirrorsResponseSchema
>;
export type MirrorState = z.infer<typeof mirrorStateSchema>;

export interface LegacyAdapterOptions {
  dataOrigin?: string;
  docsByMirrorId?: Record<string, string | null>;
  generatedAt?: Date;
}

const stateByLegacyStatus: Record<LegacyMirror['status'], MirrorState> = {
  succeeded: 'ready',
  syncing: 'syncing',
  pending: 'pending',
  failed: 'failed',
  paused: 'paused',
  cached: 'cached',
  unknown: 'unknown',
};

function completeLocalizedText(
  value: z.infer<typeof localizedTextSchema>,
  fallback: string
): { zh: string; en: string } {
  const zh = value.zh || value.en || fallback;
  const en = value.en || value.zh || fallback;
  return { zh, en };
}

function unixSecondsToRfc3339(value: number): string | null {
  if (value <= 0) return null;
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function dataUrlFor(path: string, dataOrigin: string): string {
  const origin = new URL(dataOrigin);
  const url = new URL(path, `${origin.origin}/`);
  if (url.origin !== origin.origin) {
    throw new Error(`mirror data URL escapes the configured origin: ${path}`);
  }
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.toString();
}

function compareIds(left: FrontendMirror, right: FrontendMirror): number {
  if (left.id < right.id) return -1;
  if (left.id > right.id) return 1;
  return 0;
}

function modeFor(status: LegacyMirror['status']): FrontendMirror['mode'] {
  if (status === 'cached') return 'cache';
  if (status === 'unknown') return 'unknown';
  return 'sync';
}

export function adaptLegacyMirrors(
  payload: unknown,
  options: LegacyAdapterOptions = {}
): FrontendMirrorsResponse {
  const legacyMirrors = z.array(legacyMirrorSchema).parse(payload);
  const ids = new Set<string>();
  const dataOrigin = options.dataOrigin ?? 'https://mirrors.zju.edu.cn';
  const docsByMirrorId = options.docsByMirrorId ?? {};

  const items = legacyMirrors.map((legacy): FrontendMirror => {
    if (ids.has(legacy.id)) {
      throw new Error(`duplicate mirror ID: ${legacy.id}`);
    }
    ids.add(legacy.id);

    const docsId = docsByMirrorId[legacy.id] ?? null;
    return {
      id: legacy.id,
      displayName: completeLocalizedText(legacy.name, legacy.id),
      description: completeLocalizedText(legacy.desc, legacy.id),
      dataUrl: dataUrlFor(legacy.url, dataOrigin),
      upstream: legacy.upstream,
      mode: modeFor(legacy.status),
      state: stateByLegacyStatus[legacy.status],
      sizeBytes: legacy.size,
      lastAttemptAt: unixSecondsToRfc3339(legacy.lastAttempt),
      lastSucceededAt: unixSecondsToRfc3339(legacy.lastSuccess),
      lastFailedAt: unixSecondsToRfc3339(legacy.lastFailure),
      nextScheduledAt: unixSecondsToRfc3339(legacy.nextScheduled),
      documentation: {
        id: docsId,
        available: docsId !== null,
      },
    };
  });

  return frontendMirrorsResponseSchema.parse({
    schemaVersion: 1,
    generatedAt: (options.generatedAt ?? new Date()).toISOString(),
    items: items.sort(compareIds),
  });
}
