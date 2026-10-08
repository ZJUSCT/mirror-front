import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileDocumentMarkdown,
  loadMirrorDocsMapping,
  loadMirrorzDocument,
} from './loader';
import { absoluteMarkdownLinks, exportDocumentMarkdown } from './markdown';
import { resolveVariables } from './render';

test('every vendored guide exports without unresolved directives or internal tokens', async () => {
  for (const id of Object.keys(await loadMirrorDocsMapping())) {
    const document = await loadMirrorzDocument(id);
    const markdown = exportDocumentMarkdown(document);
    assert.doesNotMatch(
      markdown,
      /ZJUMIRRORDOCS(?:TEMPLATE|CONTROL)|\{ztmpl[\s}]/,
      id
    );
    assert.doesNotMatch(document.html, /ZJUMIRRORDOCS(?:TEMPLATE|CONTROL)/, id);
    if (!document.interactiveOverride) {
      for (const group of document.controlGroups) {
        assert.ok(
          document.html.includes(`data-zdoc-controls="${group.id}"`),
          `${id}: ${group.id}`
        );
      }
    }
  }
});

test('repeated block inputs have independent selections in Markdown exports', async () => {
  const document = await loadMirrorzDocument('ubuntu');
  const groups = document.controlGroups.filter((group) => group.templateId);
  assert.ok(groups.length >= 2);
  const first = document.templates.find(
    (template) => template.id === groups[0].templateId
  )!;
  const state = { src: true, proposed: true, release: 1 };
  const markdown = exportDocumentMarkdown(document, {}, {}, true, {
    [first.id]: state,
  });
  assert.match(
    markdown,
    /^deb-src https:\/\/mirrors.zju.edu.cn\/ubuntu\/ noble main/m
  );
  assert.match(
    markdown,
    /^Suites: resolute resolute-updates resolute-backports/m
  );
  assert.match(markdown, /^# Types: deb-src/m);
  assert.match(markdown, /启用源码源 \(src\): `开启`/);
  assert.match(markdown, /启用源码源 \(src\): `关闭`/);
});

test('global controls retain their authored position and affect local and inline examples', () => {
  const inputs = [
    {
      kind: 'text' as const,
      name: 'version',
      title: 'Version',
      defaultValue: '1',
    },
  ];
  const initialVariables = { endpoint: 'https://mirrors.zju.edu.cn/example' };
  const compiled = compileDocumentMarkdown(
    'Before\n\n```{ztmpl global="true" input="version"}\n```\n\nAfter\n\n```{ztmpl}\nversion={{version}}\n```\n\n{ztmpl}`inline={{version}}`',
    inputs,
    initialVariables,
    new Map()
  );
  const document = {
    ...compiled,
    inputs,
    initialVariables,
    routeId: 'example',
    docsId: 'example',
    title: 'Example',
    requiredScheme: null,
    sourceCommit: 'test',
    interactiveOverride: false,
  };
  assert.equal(compiled.controlGroups.length, 1);
  assert.equal(compiled.controlGroups[0].templateId, undefined);
  const slot = compiled.html.indexOf('data-zdoc-controls');
  assert.ok(
    slot > compiled.html.indexOf('Before') &&
      slot < compiled.html.indexOf('After')
  );
  const markdown = exportDocumentMarkdown(document, { version: '2' }, {}, true);
  assert.match(markdown, /version=2/);
  assert.match(markdown, /inline=2/);
  assert.doesNotMatch(markdown, /ZJUMIRRORDOCS|\{ztmpl/);
});

test('release options remain local and do not retain stale auxiliary variables', async () => {
  const document = await loadMirrorzDocument('debian');
  const input = document.inputs.find((input) => input.name === 'release');
  assert.equal(input?.kind, 'select');
  if (input?.kind !== 'select') return;
  const sid = input.choices.findIndex(
    (choice) => choice.values.release === 'sid'
  );
  const traditional = document.templates.find((t) =>
    t.inputNames.includes('release')
  )!;
  const deb822 = document.templates.find((t) =>
    t.inputNames.includes('release_deb822')
  )!;
  const options = { federated: true, https: false, sudo: false };
  const selected = { release: sid };
  assert.equal(
    resolveVariables(document, selected, options, traditional.inputNames).sid,
    true
  );
  assert.equal(
    resolveVariables(document, selected, options, deb822.inputNames).sid,
    undefined
  );
  assert.equal(
    resolveVariables(document, { release: 0 }, options, traditional.inputNames)
      .sid,
    undefined
  );
  const markdown = exportDocumentMarkdown(document, selected, options, true);
  assert.match(markdown, /http:\/\/mirrors.cernet.edu.cn\/debian/);
  assert.match(markdown, /当前页面选项/);
  assert.match(markdown, /sudo：关闭/);
});

test('indented templates preserve append instructions and inline code delimiters', () => {
  const source =
    '1. 配置\n\n    ```{ztmpl path="/etc/example" append="true" lang="sh"}\n    echo {{endpoint}}\n    ```\n\n{ztmpl}`{{endpoint}}`';
  const initialVariables = {
    endpoint: 'https://mirrors.zju.edu.cn/example',
    sudo: 'sudo ',
  };
  const compiled = compileDocumentMarkdown(
    source,
    [],
    initialVariables,
    new Map()
  );
  const document = {
    ...compiled,
    routeId: 'example',
    docsId: 'example',
    title: 'Example',
    inputs: [],
    initialVariables,
    requiredScheme: null,
    sourceCommit: 'test',
    interactiveOverride: false,
  };
  const markdown = exportDocumentMarkdown(document);
  assert.match(markdown, /    追加到/);
  assert.match(
    markdown,
    /    ```sh\n    echo https:\/\/mirrors.zju.edu.cn\/example/
  );
  assert.doesNotMatch(markdown, /\{ztmpl|TOKEN/);
  assert.match(compiled.html, /data-zdoc-template/);
});

test('links become absolute without modifying links inside code', () => {
  const source =
    '[guide](/docs/debian/)\n\n![image](/image.png)\n\n`[code](/keep)`\n\n```sh\n[code](/keep)\n```\n';
  const markdown = absoluteMarkdownLinks(
    source,
    'https://mirrors.zju.edu.cn/docs/test/'
  );
  assert.match(
    markdown,
    /\[guide\]\(<https:\/\/mirrors.zju.edu.cn\/docs\/debian\/>\)/
  );
  assert.match(
    markdown,
    /!\[image\]\(<https:\/\/mirrors.zju.edu.cn\/image.png>\)/
  );
  assert.equal(markdown.match(/\[code\]\(\/keep\)/g)?.length, 2);
});
