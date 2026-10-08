import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { hasDocumentInteractiveOverride } from './loader';

test('only index.mdx enables a document interactive override', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'mirror-front-overrides-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const example = path.join(root, 'example');
  await mkdir(example, { recursive: true });
  await Promise.all([
    writeFile(path.join(example, 'zh.yaml'), '_: ignored'),
    writeFile(path.join(example, 'intro.zh.md'), 'ignored'),
    writeFile(path.join(example, 'intro.zh.mdx'), 'ignored'),
  ]);

  assert.equal(await hasDocumentInteractiveOverride('example', root), false);
  await writeFile(path.join(example, 'index.mdx'), '# Interactive');
  assert.equal(await hasDocumentInteractiveOverride('example', root), true);
});
