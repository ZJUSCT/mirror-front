import { z } from 'zod';

const statusTokens = /^(?:[SDYFPCRUOXN](?:\d+)?)$/;
const mainStatusCodes = new Set(['S', 'D', 'Y', 'F', 'P', 'C', 'R', 'U']);

const mirrorzStatusSchema = z
  .string()
  .min(1)
  .superRefine((status, context) => {
    const tokens = status.match(/[A-Z](?:\d+)?/g);
    if (!tokens || tokens.join('') !== status) {
      context.addIssue({
        code: 'custom',
        message: 'status must be a concatenation of MirrorZ status tokens',
      });
      return;
    }

    if (tokens.some((token) => !statusTokens.test(token))) {
      context.addIssue({
        code: 'custom',
        message: 'status contains a token outside MirrorZ Data Format v1.7',
      });
    }

    const mainStatuses = tokens.filter((token) =>
      mainStatusCodes.has(token.charAt(0))
    );
    if (mainStatuses.length !== 1) {
      context.addIssue({
        code: 'custom',
        message: 'status must contain exactly one main MirrorZ status',
      });
    }
  });

const mirrorzSiteSchema = z.looseObject({
  url: z.url(),
  abbr: z.string().min(1),
  name: z.string().optional(),
  logo: z.string().optional(),
  logo_darkmode: z.string().optional(),
  homepage: z.string().optional(),
  issue: z.string().optional(),
  request: z.string().optional(),
  email: z.string().optional(),
  group: z.string().optional(),
  disk: z.string().optional(),
  note: z.string().optional(),
  big: z.string().optional(),
  disable: z.boolean().optional(),
});

const mirrorzInfoSchema = z.looseObject({
  distro: z.string(),
  category: z.string(),
  urls: z.array(
    z.looseObject({
      name: z.string(),
      url: z.string(),
    })
  ),
});

export const mirrorzMirrorSchema = z.looseObject({
  cname: z.string().min(1),
  desc: z.string().optional(),
  url: z.string().min(1),
  status: mirrorzStatusSchema,
  help: z.string().optional(),
  upstream: z.string().optional(),
  size: z.string().optional(),
  disable: z.boolean().optional(),
});

export const mirrorzDataSchema = z
  .looseObject({
    version: z.literal(1.7).optional(),
    site: mirrorzSiteSchema,
    info: z.array(mirrorzInfoSchema),
    mirrors: z.array(mirrorzMirrorSchema),
  })
  .superRefine((data, context) => {
    const names = new Set<string>();
    data.mirrors.forEach((mirror, index) => {
      if (names.has(mirror.cname)) {
        context.addIssue({
          code: 'custom',
          path: ['mirrors', index, 'cname'],
          message: `duplicate mirror cname: ${mirror.cname}`,
        });
      }
      names.add(mirror.cname);
    });
  });

export type MirrorzData = z.infer<typeof mirrorzDataSchema>;
export type MirrorzMirror = z.infer<typeof mirrorzMirrorSchema>;

export type MirrorPresentationState =
  | 'ready'
  | 'syncing'
  | 'pending'
  | 'failed'
  | 'paused'
  | 'cached'
  | 'proxied'
  | 'disabled'
  | 'unknown';

const stateByStatusCode: Record<string, MirrorPresentationState> = {
  S: 'ready',
  D: 'pending',
  Y: 'syncing',
  F: 'failed',
  P: 'paused',
  C: 'cached',
  R: 'proxied',
  U: 'unknown',
};

export function mirrorPresentationState(
  mirror: MirrorzMirror,
  siteDisabled = false
): MirrorPresentationState {
  if (siteDisabled || mirror.disable) return 'disabled';
  const mainStatus = mirror.status
    .match(/[A-Z](?:\d+)?/g)
    ?.find((token) => mainStatusCodes.has(token.charAt(0)));
  return mainStatus
    ? (stateByStatusCode[mainStatus.charAt(0)] ?? 'unknown')
    : 'unknown';
}

export const stateLabels: Record<MirrorPresentationState, string> = {
  ready: 'SUCCEEDED',
  syncing: 'SYNCING',
  pending: 'PENDING',
  failed: 'FAILED',
  paused: 'PAUSED',
  cached: 'CACHED',
  proxied: 'PROXIED',
  disabled: 'DISABLED',
  unknown: 'UNKNOWN',
};

export interface ParsedMirrorStatus {
  main: { code: string; ts?: number };
  /** Auxiliary O: timestamp of the successful snapshot currently being served. */
  servedAt?: number;
  /** Auxiliary N: timestamp the mirror was added. */
  createdAt?: number;
  /** Auxiliary X: next scheduled sync. */
  nextSyncAt?: number;
}

export function parseMirrorStatus(status: string): ParsedMirrorStatus {
  let main: ParsedMirrorStatus['main'] | undefined;
  let servedAt: number | undefined;
  let createdAt: number | undefined;
  let nextSyncAt: number | undefined;
  for (const token of status.match(/[A-Z](?:\d+)?/g) ?? []) {
    const code = token.charAt(0);
    const ts = token.length > 1 ? Number(token.slice(1)) : undefined;
    if (!main && mainStatusCodes.has(code)) {
      main = { code, ts };
    } else if (code === 'O') {
      servedAt = ts;
    } else if (code === 'N') {
      createdAt = ts;
    } else if (code === 'X') {
      nextSyncAt = ts;
    }
  }
  return { main: main ?? { code: 'U' }, servedAt, createdAt, nextSyncAt };
}

export function resolveMirrorzUrl(
  siteUrl: string,
  value: string
): string | null {
  try {
    const resolved = new URL(value, `${siteUrl.replace(/\/$/, '')}/`);
    return resolved.protocol === 'http:' || resolved.protocol === 'https:'
      ? resolved.toString()
      : null;
  } catch {
    return null;
  }
}
