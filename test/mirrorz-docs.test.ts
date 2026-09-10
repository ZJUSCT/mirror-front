import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, test } from 'vitest';

import docsLock from '../mirrorz-docs.lock.json';
import {
  highlightCode,
  normalizeCodeLanguage,
} from '../src/lib/code-highlighting';
import {
  compileDocumentMarkdown,
  getMappedDocumentRoutes,
  loadMirrorDocsMapping,
  loadMirrorDocsTitles,
  loadMirrorzDocument,
} from '../src/lib/mirrorz-docs/loader';
import {
  CERNET_MIRROR_ORIGIN,
  federatedMirrorUrl,
  isZjuMirrorUrl,
  replaceMirrorOrigin,
} from '../src/lib/mirror-endpoint';

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));

describe('pinned MirrorZ Docs input', () => {
  test('keeps provenance metadata aligned with the submodule gitlink', async () => {
    const parentRevision = await execFileAsync(
      'git',
      ['rev-parse', 'HEAD:vendor/mirrorz-docs'],
      { cwd: repositoryRoot }
    );
    const checkoutRevision = await execFileAsync(
      'git',
      ['-C', 'vendor/mirrorz-docs', 'rev-parse', 'HEAD'],
      { cwd: repositoryRoot }
    );

    expect(checkoutRevision.stdout.trim()).toBe(parentRevision.stdout.trim());
    expect(docsLock.commit).toBe(parentRevision.stdout.trim());
  });

  test('highlights the documented language set and safely falls back', () => {
    expect(normalizeCodeLanguage('shell')).toBe('bash');
    expect(normalizeCodeLanguage('HTML')).toBe('xml');
    expect(normalizeCodeLanguage('not-a-language')).toBeNull();
    expect(normalizeCodeLanguage(undefined)).toBeNull();

    const highlighted = highlightCode('echo "$HOME"', 'bash');
    expect(highlighted?.language).toBe('bash');
    expect(highlighted?.html).toContain('hljs-variable');

    const escaped = highlightCode('<script>alert(1)</script>', 'html');
    expect(escaped?.html).toContain('&lt;');
    expect(escaped?.html).toContain('script');
    expect(escaped?.html).not.toContain('<script>');
    expect(highlightCode('<unsafe>', 'unknown')).toBeNull();
  });

  test('preserves paths when selecting the CERNET federation', () => {
    expect(federatedMirrorUrl('/debian')).toBe(
      'https://mirrors.cernet.edu.cn/debian'
    );
    expect(
      replaceMirrorOrigin(
        'http://mirrors.zju.edu.cn/gitrepos/rosdistro',
        CERNET_MIRROR_ORIGIN
      )
    ).toBe('http://mirrors.cernet.edu.cn/gitrepos/rosdistro');
    expect(isZjuMirrorUrl('http://mirrors.zju.edu.cn/ubuntu')).toBe(true);
    expect(isZjuMirrorUrl('https://mirrors.cernet.edu.cn/ubuntu')).toBe(false);
  });

  test('compiles every explicitly mapped mirror document', async () => {
    const mapping = await loadMirrorDocsMapping();
    const routes = await getMappedDocumentRoutes();
    const documents = await Promise.all(routes.map(loadMirrorzDocument));

    expect(routes).toHaveLength(52);
    expect(Object.keys(mapping)).toHaveLength(63);
    expect(
      Object.values(mapping).filter((entry) => entry.docsId === null)
    ).toHaveLength(11);
    expect(new Set(routes).size).toBe(routes.length);
    expect(documents.every((document) => document.html.length > 0)).toBe(true);
  });

  test('loads document titles for the mirror catalog', async () => {
    const titles = await loadMirrorDocsTitles();

    expect(titles.ubuntu).toBe('Ubuntu 软件仓库');
    expect(Object.keys(titles)).toHaveLength(52);
  });

  test('turns Debian ztmpl blocks into interactive, safe templates', async () => {
    const document = await loadMirrorzDocument('debian');

    expect(document.inputs.map((input) => input.name)).toContain('release');
    expect(document.templates.length).toBeGreaterThan(2);
    expect(document.html).toContain('data-zdoc-template="template-0"');
    expect(document.html).toContain('<pre tabindex="0">');
    expect(document.html).toContain('https://mirrors.zju.edu.cn/debian');
    expect(document.html).not.toContain('<script');
    const templateContents = [
      ...document.html.matchAll(
        /<code\b[^>]*data-zdoc-template[^>]*>([\s\S]*?)<\/code>/gi
      ),
    ].map((match) => match[1]);
    expect(templateContents).toHaveLength(document.templates.length);
    expect(templateContents.every((content) => !/<[^>]+>/.test(content))).toBe(
      true
    );
    expect(document.html).toContain(
      '# \u9ed8\u8ba4\u6ce8\u91ca\u4e86\u6e90\u7801\u955c\u50cf\u4ee5\u63d0\u9ad8 apt update \u901f\u5ea6'
    );
  });

  test('keeps links to retired upstream guides on an explicit local notice', async () => {
    const document = await loadMirrorzDocument('gentoo-portage');

    expect(document.html).toContain('/docs/gentoo-portage.git/');
    expect(document.html).not.toContain(
      'https://help.mirrorz.org/gentoo-portage.git/'
    );
  });

  test('enforces document filters from upstream configuration', async () => {
    const document = await loadMirrorzDocument('pypi');

    expect(document.requiredScheme).toBe('https');
    expect(document.initialVariables.scheme).toBe('https');
    expect(document.initialVariables.endpoint).toBe(
      'https://mirrors.zju.edu.cn/pypi'
    );
  });

  test('supports heading IDs, inline attributes, and global input declarations', () => {
    const compiled = compileDocumentMarkdown(
      [
        '### Plain heading',
        '',
        '### Stable heading {#stable-heading}',
        '',
        '```{ztmpl global="true" input="value"}',
        'ignored',
        '```',
        '',
        '{ztmpl lang="ini"}`value={{value}}`',
      ].join('\n'),
      [
        {
          kind: 'text',
          name: 'value',
          title: 'Value',
          defaultValue: '',
        },
      ],
      { value: '<tag>&' },
      new Map()
    );

    expect(compiled.html).toContain('<h3>Plain heading</h3>');
    expect(compiled.html).toContain(
      '<h3 id="stable-heading">Stable heading</h3>'
    );
    expect(compiled.html).toContain('data-language="ini"');
    expect(compiled.html).toContain('value=&lt;tag&gt;&amp;');
    expect(compiled.html).not.toContain('&amp;amp;');
    expect(compiled.html).not.toContain('ignored');
    expect(compiled.templates).toHaveLength(1);
  });

  test('rejects undocumented MyST directives', () => {
    expect(() =>
      compileDocumentMarkdown('```{danger}\nunsafe\n```', [], {}, new Map())
    ).toThrow('unsupported directive');
    expect(() =>
      compileDocumentMarkdown('{danger}`unsafe`', [], {}, new Map())
    ).toThrow('unsupported role');
    expect(() =>
      compileDocumentMarkdown(
        '```{ztmpl surprise="true"}\nunsafe\n```',
        [],
        {},
        new Map()
      )
    ).toThrow('unsupported ztmpl option');
  });

  test('does not mistake shell brace expansion inside code for a MyST role', () => {
    const compiled = compileDocumentMarkdown(
      '`homebrew-cask-{drivers,versions,fonts}`',
      [],
      {},
      new Map()
    );

    expect(compiled.html).toContain(
      '<code>homebrew-cask-{drivers,versions,fonts}</code>'
    );
  });

  test('removes executable HTML from upstream Markdown', () => {
    const compiled = compileDocumentMarkdown(
      '<script>globalThis.compromised = true</script>\n\nSafe text.',
      [],
      {},
      new Map()
    );

    expect(compiled.html).not.toContain('<script');
    expect(compiled.html).toContain('Safe text.');
  });
});
