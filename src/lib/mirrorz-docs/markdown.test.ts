import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compileDocumentMarkdown,
  loadMirrorDocsMapping,
  loadMirrorzDocument,
} from './loader';
import { absoluteMarkdownLinks, exportDocumentMarkdown } from './markdown';
import { renderTemplateText, resolveVariables } from './render';

test('every vendored guide exports without unresolved directives or internal tokens', async () => {
  for (const id of Object.keys(await loadMirrorDocsMapping())) {
    const document = await loadMirrorzDocument(id);
    const markdown = exportDocumentMarkdown(document);
    assert.doesNotMatch(markdown, /ZJUMIRRORDOCSTEMPLATE|\{ztmpl[\s}]/, id);
    assert.ok(markdown.includes(document.sourceCommit), id);
    assert.ok(markdown.includes('CC BY-NC-SA 4.0'), id);
    assert.ok(markdown.includes('内容语言：zh'), id);
  }
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
  for (const template of [traditional, deb822]) {
    const code = renderTemplateText(
      template.source,
      resolveVariables(document, selected, options, template.inputNames)
    );
    assert.ok(markdown.includes(code));
  }
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

test('required protocol overrides a selected protocol', async () => {
  const document = await loadMirrorzDocument('debian');
  document.requiredScheme = 'https';
  assert.equal(
    resolveVariables(document, {}, { https: false }).scheme,
    'https'
  );
});
