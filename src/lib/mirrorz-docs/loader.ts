import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { parse as parseYaml } from 'yaml';

import docsLock from '../../../mirrorz-docs.lock.json';
import { ZJU_MIRROR_ORIGIN } from '../mirror-endpoint';
import type {
  DocumentInput,
  DocumentTemplate,
  MirrorDocsMapping,
  MirrorzDocument,
  TemplateValue,
  TemplateVariables,
} from './types';
import { renderTemplateText } from './render';

const repositoryRoot = path.resolve(process.cwd());
const docsRoot = path.join(repositoryRoot, 'vendor', 'mirrorz-docs');

interface RawInput {
  _?: string;
  note?: string;
  option?: Record<string, Record<string, unknown> | null>;
  default?: string | boolean;
  true?: TemplateValue | null;
  false?: TemplateValue | null;
}

interface RawDocumentConfig {
  _?: string;
  block?: string[];
  filter?: {
    scheme?: string;
  };
  input?: Record<string, RawInput | null>;
}

interface DirectiveOptions {
  lang?: string;
  input?: string;
  path?: string;
  append?: string;
  global?: string;
}

let mappingPromise: Promise<Record<string, MirrorDocsMapping>> | undefined;
let titlePromise: Promise<Record<string, string>> | undefined;

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseDirectiveOptions(source: string): DirectiveOptions {
  const result: DirectiveOptions = {};
  const allowedOptions = new Set<keyof DirectiveOptions>([
    'lang',
    'input',
    'path',
    'append',
    'global',
  ]);
  const attribute = /([a-z_]+)=(?:"([^"]*)"|'([^']*)')/gi;
  let consumed = '';
  for (const match of source.matchAll(attribute)) {
    const [whole, key, doubleQuoted, singleQuoted] = match;
    const normalizedKey = key.toLowerCase() as keyof DirectiveOptions;
    if (!allowedOptions.has(normalizedKey)) {
      throw new Error(`unsupported ztmpl option: ${key}`);
    }
    if (result[normalizedKey] !== undefined) {
      throw new Error(`duplicate ztmpl option: ${key}`);
    }
    result[normalizedKey] = doubleQuoted ?? singleQuoted ?? '';
    consumed += whole;
  }
  const residue = source.replace(attribute, '').replaceAll(/\s+/g, '').trim();
  if (residue || (consumed.length === 0 && source.trim())) {
    throw new Error(`invalid ztmpl directive options: ${source.trim()}`);
  }
  return result;
}

function asTemplateValue(value: unknown): TemplateValue {
  if (typeof value === 'boolean' || typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

function normalizeInputs(
  rawInputs: RawDocumentConfig['input']
): DocumentInput[] {
  return Object.entries(rawInputs ?? {})
    .filter((entry): entry is [string, RawInput] => entry[1] !== null)
    .map(([name, input]) => {
      if (typeof input !== 'object' || Array.isArray(input)) {
        throw new Error(`input ${name} must be an object`);
      }
      const unknownInputKey = Object.keys(input).find(
        (key) =>
          !['_', 'note', 'option', 'default', 'true', 'false'].includes(key)
      );
      if (unknownInputKey) {
        throw new Error(
          `input ${name} has an unsupported key: ${unknownInputKey}`
        );
      }
      if (input._ !== undefined && typeof input._ !== 'string') {
        throw new Error(`input ${name} has an invalid title`);
      }
      if (input.note !== undefined && typeof input.note !== 'string') {
        throw new Error(`input ${name} has an invalid note`);
      }
      const common = {
        name,
        title: input._ ?? name,
        ...(input.note ? { note: input.note } : {}),
      };

      const hasOptions = Object.hasOwn(input, 'option');
      const hasBooleanValues =
        Object.hasOwn(input, 'true') || Object.hasOwn(input, 'false');
      if (hasOptions && hasBooleanValues) {
        throw new Error(`input ${name} mixes select and Boolean values`);
      }

      if (hasOptions) {
        if (
          !input.option ||
          typeof input.option !== 'object' ||
          Array.isArray(input.option)
        ) {
          throw new Error(`options for input ${name} must be an object`);
        }
        if (input.default !== undefined && typeof input.default !== 'string') {
          throw new Error(`input ${name} has an invalid select default`);
        }
        const entries = Object.entries(input.option);
        if (entries.length === 0) {
          throw new Error(`input ${name} has no options`);
        }
        const defaultName =
          typeof input.default === 'string' ? input.default : entries[0]?.[0];
        if (
          typeof input.default === 'string' &&
          !entries.some(([optionName]) => optionName === input.default)
        ) {
          throw new Error(`input ${name} has an unknown default option`);
        }
        const sorted = [...entries].sort(([left], [right]) => {
          if (left === defaultName) return -1;
          if (right === defaultName) return 1;
          return 0;
        });
        return {
          ...common,
          kind: 'select' as const,
          defaultIndex: 0,
          choices: sorted.map(([optionName, rawSettings]) => {
            if (
              rawSettings !== null &&
              (typeof rawSettings !== 'object' || Array.isArray(rawSettings))
            ) {
              throw new Error(
                `option ${optionName} for input ${name} must be an object`
              );
            }
            const settings = rawSettings ?? {};
            const values: TemplateVariables = { [name]: optionName };
            for (const [key, value] of Object.entries(settings)) {
              if (key !== '_') values[key] = asTemplateValue(value);
            }
            return {
              label: typeof settings._ === 'string' ? settings._ : optionName,
              values,
            };
          }),
        };
      }

      if (hasBooleanValues) {
        if (input.default !== undefined && typeof input.default !== 'boolean') {
          throw new Error(`input ${name} has an invalid Boolean default`);
        }
        for (const value of [input.true, input.false]) {
          if (
            value !== undefined &&
            value !== null &&
            typeof value !== 'boolean' &&
            typeof value !== 'string'
          ) {
            throw new Error(`input ${name} has an invalid Boolean value`);
          }
        }
        return {
          ...common,
          kind: 'boolean' as const,
          defaultValue:
            typeof input.default === 'boolean' ? input.default : false,
          trueValue:
            input.true === null || input.true === undefined ? true : input.true,
          falseValue:
            input.false === null || input.false === undefined
              ? false
              : input.false,
        };
      }

      if (input.default !== undefined && typeof input.default !== 'string') {
        throw new Error(`input ${name} has an invalid text default`);
      }

      return {
        ...common,
        kind: 'text' as const,
        defaultValue: typeof input.default === 'string' ? input.default : '',
      };
    });
}

function defaultInputVariables(inputs: DocumentInput[]): TemplateVariables {
  const variables: TemplateVariables = {};
  for (const input of inputs) {
    if (input.kind === 'select') {
      Object.assign(variables, input.choices[input.defaultIndex]?.values ?? {});
    } else if (input.kind === 'boolean') {
      variables[input.name] = input.defaultValue
        ? input.trueValue
        : input.falseValue;
    } else {
      variables[input.name] = input.defaultValue;
    }
  }
  return variables;
}

function baseVariables(
  publicPath: string,
  scheme: 'http' | 'https' = 'https'
): TemplateVariables {
  const parsed = new URL(publicPath, ZJU_MIRROR_ORIGIN);
  parsed.protocol = `${scheme}:`;
  const endpoint = parsed.toString();
  return {
    mirror: `${parsed.host}${parsed.pathname}`,
    host: parsed.host,
    path: parsed.pathname,
    scheme: parsed.protocol.slice(0, -1),
    http_protocol: `${parsed.protocol}//`,
    endpoint: endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint,
    sudo: 'sudo ',
    sudoE: 'sudo -E ',
  };
}

function templateBlock(
  template: DocumentTemplate,
  variables: TemplateVariables
): string {
  const rendered = escapeHtml(renderTemplateText(template.source, variables));
  const language = template.language
    ? ` data-language="${escapeHtml(template.language)}"`
    : '';
  if (template.inline) {
    return `<code data-zdoc-template="${template.id}"${language}>${rendered}</code>`;
  }
  const caption = template.filepath
    ? `<figcaption>${escapeHtml(template.filepath)}</figcaption>`
    : '';
  return `<figure class="zdoc-template">${caption}<pre tabindex="0"><code data-zdoc-template="${template.id}"${language}>${rendered}</code></pre></figure>`;
}

function templateToken(template: DocumentTemplate): string {
  return `ZJUMIRRORDOCSTEMPLATE${template.id.replaceAll('-', '').toUpperCase()}TOKEN`;
}

function rewriteRelativeDocLinks(
  markdown: string,
  routeByDocsId: Map<string, string>
): string {
  return markdown.replaceAll(
    /\]\(\.\.\/([^/)]+)\/?\)/g,
    (_whole, target: string) => {
      const localRoute = routeByDocsId.get(target);
      const href = localRoute
        ? `/docs/${localRoute}/`
        : `https://help.mirrorz.org/${target}/`;
      return `](${href})`;
    }
  );
}

export function compileDocumentMarkdown(
  markdown: string,
  inputs: DocumentInput[],
  initialVariables: TemplateVariables,
  routeByDocsId: Map<string, string>
): { html: string; templates: DocumentTemplate[] } {
  const templates: DocumentTemplate[] = [];
  const unknownDirective = markdown.match(/```\{(?!ztmpl\b)([^}\s]+)/);
  if (unknownDirective) {
    throw new Error(`unsupported directive: ${unknownDirective[1]}`);
  }
  const roleScan = markdown.replaceAll(
    /(`+)([^`\n]*?)\1/g,
    (_whole, delimiter: string, content: string) =>
      `${delimiter}${' '.repeat(content.length)}${delimiter}`
  );
  const unknownRole = roleScan.match(
    /\{(?!ztmpl(?:\s|\}))([a-z][\w-]*)(?:[^}]*)\}(?=`)/i
  );
  if (unknownRole) {
    throw new Error(`unsupported role: ${unknownRole[1]}`);
  }

  let transformed = rewriteRelativeDocLinks(markdown, routeByDocsId);
  transformed = transformed.replaceAll(
    /^```\{ztmpl([^}]*)\}\s*\n([\s\S]*?)^```\s*$/gm,
    (_whole, rawOptions: string, source: string) => {
      const options = parseDirectiveOptions(rawOptions);
      const inputNames = options.input?.split(/\s+/).filter(Boolean) ?? [];
      for (const name of inputNames) {
        if (!inputs.some((input) => input.name === name)) {
          throw new Error(`ztmpl references undefined input: ${name}`);
        }
      }
      if (options.global !== undefined && options.global !== 'true') {
        throw new Error('ztmpl global must be "true"');
      }
      if (
        options.append !== undefined &&
        options.append !== 'true' &&
        options.append !== 'false'
      ) {
        throw new Error('ztmpl append must be "true" or "false"');
      }
      if (options.global === 'true') {
        if (
          inputNames.length === 0 ||
          options.lang !== undefined ||
          options.path !== undefined ||
          options.append !== undefined
        ) {
          throw new Error('global ztmpl blocks may only declare inputs');
        }
        return '';
      }
      const template: DocumentTemplate = {
        id: `template-${templates.length}`,
        source: source.replace(/\n$/, ''),
        inline: false,
        inputNames,
        ...(options.lang ? { language: options.lang } : {}),
        ...(options.path ? { filepath: options.path } : {}),
        append: options.append === 'true',
      };
      templates.push(template);
      return `\n${templateToken(template)}\n`;
    }
  );
  transformed = transformed.replaceAll(
    /\{ztmpl([^}]*)\}`([^`]+)`/g,
    (_whole, rawOptions: string, source: string) => {
      const options = parseDirectiveOptions(rawOptions);
      if (
        Object.entries(options).some(
          ([name, value]) => name !== 'lang' && value !== undefined
        )
      ) {
        throw new Error('inline ztmpl roles only support lang');
      }
      const template: DocumentTemplate = {
        id: `template-${templates.length}`,
        source,
        inline: true,
        inputNames: [],
        ...(options.lang ? { language: options.lang } : {}),
        append: false,
      };
      templates.push(template);
      return templateToken(template);
    }
  );

  const renderedMarkdown = marked.parse(transformed, {
    async: false,
    gfm: true,
  }) as string;
  const rendered = renderedMarkdown.replaceAll(
    /<h([1-6])>([\s\S]*?)<\/h\1>/g,
    (whole, level: string, content: string) => {
      const explicitId = content.match(
        /^([\s\S]*?)\s+\{#([A-Za-z0-9][A-Za-z0-9_.:-]*)\}$/
      );
      return explicitId
        ? `<h${level} id="${explicitId[2]}">${explicitId[1]}</h${level}>`
        : whole;
    }
  );
  let html = sanitizeHtml(rendered, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'figure',
      'figcaption',
      'img',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ['href', 'title'],
      code: ['class', 'data-language', 'data-zdoc-template'],
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
  for (const template of templates) {
    const token = templateToken(template);
    const replacement = templateBlock(template, initialVariables);
    html = template.inline
      ? html.replaceAll(token, replacement)
      : html.replaceAll(`<p>${token}</p>`, replacement);
  }
  return { html, templates };
}

async function loadAvailableDocIds(): Promise<Set<string>> {
  const entries = await readdir(docsRoot, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const available = await Promise.all(
    directories.map(async (name) => {
      try {
        await stat(path.join(docsRoot, name, 'zh.yaml'));
        return name;
      } catch {
        return null;
      }
    })
  );
  return new Set(available.filter((name): name is string => name !== null));
}

// Every vendored guide is rendered unconditionally. Route generation never
// consults the live mirror catalog: a mirror that is temporarily absent from
// mirrorz.json (for example mid-migration while its publish deployment is not
// Ready) keeps its guide page, and a guide without a hosted mirror gets one too.
export async function loadMirrorDocsMapping(): Promise<
  Record<string, MirrorDocsMapping>
> {
  mappingPromise ??= loadAvailableDocIds().then((available) =>
    Object.fromEntries(
      [...available].map((id) => [
        id,
        { docsId: id, publicPath: `/${id}` },
      ])
    )
  );
  return mappingPromise;
}

export async function loadMirrorDocsTitles(): Promise<Record<string, string>> {
  titlePromise ??= loadMirrorDocsMapping().then(async (mapping) => {
    const docsIds = [
      ...new Set(
        Object.values(mapping)
          .map(({ docsId }) => docsId)
          .filter((docsId): docsId is string => docsId !== null)
      ),
    ];
    const entries = await Promise.all(
      docsIds.map(async (docsId) => {
        const source = await readFile(
          path.join(docsRoot, docsId, 'zh.yaml'),
          'utf8'
        );
        const config = parseYaml(source) as { _?: unknown } | null;
        if (typeof config?._ !== 'string' || !config._.trim()) {
          throw new Error(`${docsId}/zh.yaml has no title`);
        }
        return [docsId, config._] as const;
      })
    );
    return Object.fromEntries(entries);
  });
  return titlePromise;
}

export async function loadMirrorzDocument(
  routeId: string
): Promise<MirrorzDocument> {
  const mapping = await loadMirrorDocsMapping();
  const selected = mapping[routeId];
  if (!selected?.docsId) throw new Error(`no mapped document for ${routeId}`);

  const configPath = path.join(docsRoot, selected.docsId, 'zh.yaml');
  const parsedConfig = parseYaml(await readFile(configPath, 'utf8')) as unknown;
  if (
    !parsedConfig ||
    typeof parsedConfig !== 'object' ||
    Array.isArray(parsedConfig)
  ) {
    throw new Error(`${selected.docsId}/zh.yaml must contain an object`);
  }
  const unknownConfigKey = Object.keys(parsedConfig).find(
    (key) => !['_', 'block', 'filter', 'input'].includes(key)
  );
  if (unknownConfigKey) {
    throw new Error(
      `${selected.docsId}/zh.yaml has an unsupported key: ${unknownConfigKey}`
    );
  }
  const config = parsedConfig as RawDocumentConfig;
  if (typeof config._ !== 'string' || !config._.trim()) {
    throw new Error(`${selected.docsId}/zh.yaml has no title`);
  }
  if (
    config.block !== undefined &&
    (!Array.isArray(config.block) ||
      config.block.some((block) => typeof block !== 'string' || !block))
  ) {
    throw new Error(`${selected.docsId}/zh.yaml has invalid content blocks`);
  }
  if (
    config.input !== undefined &&
    (!config.input ||
      typeof config.input !== 'object' ||
      Array.isArray(config.input))
  ) {
    throw new Error(`${selected.docsId}/zh.yaml has invalid inputs`);
  }
  if (
    config.filter !== undefined &&
    (!config.filter ||
      typeof config.filter !== 'object' ||
      Array.isArray(config.filter) ||
      Object.keys(config.filter).some((key) => key !== 'scheme'))
  ) {
    throw new Error(`${selected.docsId}/zh.yaml has invalid filters`);
  }
  const configuredScheme = config.filter?.scheme;
  if (
    configuredScheme !== undefined &&
    configuredScheme !== 'http' &&
    configuredScheme !== 'https'
  ) {
    throw new Error(`${selected.docsId}/zh.yaml has an invalid scheme filter`);
  }
  const requiredScheme = configuredScheme ?? null;

  const inputs = normalizeInputs(config.input);
  const initialVariables = {
    ...defaultInputVariables(inputs),
    ...baseVariables(selected.publicPath, requiredScheme ?? 'https'),
  };
  const routeByDocsId = new Map<string, string>();
  for (const [mirrorId, candidate] of Object.entries(mapping)) {
    if (candidate.docsId) routeByDocsId.set(candidate.docsId, mirrorId);
  }

  const htmlParts: string[] = [];
  const templates: DocumentTemplate[] = [];
  for (const block of config.block ?? ['index']) {
    const blockPath = path.join(docsRoot, selected.docsId, `${block}.zh.md`);
    const source = await readFile(blockPath, 'utf8');
    const compiled = compileDocumentMarkdown(
      source,
      inputs,
      initialVariables,
      routeByDocsId
    );
    const offset = templates.length;
    htmlParts.push(
      compiled.html.replaceAll(
        /template-(\d+)/g,
        (_whole, value: string) => `template-${Number(value) + offset}`
      )
    );
    templates.push(
      ...compiled.templates.map((template, index) => ({
        ...template,
        id: `template-${offset + index}`,
      }))
    );
  }

  return {
    routeId,
    docsId: selected.docsId,
    title: config._,
    html: htmlParts.join('\n'),
    inputs,
    templates,
    initialVariables,
    requiredScheme,
    sourceCommit: docsLock.commit,
  };
}
