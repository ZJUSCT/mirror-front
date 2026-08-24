import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { verifyBuild } from '../scripts/verify-build.mjs';

async function makeFixture({ sealed = true } = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mirror-front-build-'));
  await mkdir(path.join(root, 'autoindex'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), '<!doctype html>');
  await writeFile(path.join(root, '404.html'), '<!doctype html>');
  await writeFile(path.join(root, 'manifest.webmanifest'), '{}');
  await writeFile(path.join(root, 'sitemap-index.xml'), '<sitemapindex/>');
  await writeFile(path.join(root, 'sitemap-0.xml'), '<urlset/>');
  await mkdir(path.join(root, 'docs', 'debian'), { recursive: true });
  await writeFile(
    path.join(root, 'docs', 'debian', 'index.html'),
    '<!doctype html>'
  );
  await mkdir(path.join(root, 'en', 'docs', 'debian'), { recursive: true });
  await writeFile(
    path.join(root, 'en', 'docs', 'debian', 'index.html'),
    '<!doctype html>'
  );
  for (const route of ['almalinux', 'crates.io-index.git']) {
    await mkdir(path.join(root, 'docs', route), { recursive: true });
    await writeFile(
      path.join(root, 'docs', route, 'index.html'),
      '<!doctype html>'
    );
    await mkdir(path.join(root, 'en', 'docs', route), { recursive: true });
    await writeFile(
      path.join(root, 'en', 'docs', route, 'index.html'),
      '<!doctype html>'
    );
  }
  await writeFile(
    path.join(root, 'autoindex', 'index.html'),
    `<!doctype html><meta content="script-src ${
      sealed ? "'sha256-fixturehash'" : 'AUTOINDEX_SCRIPT_HASHES'
    }"><table id="autoindex-list"></table>`
  );
  for (let index = 0; index < 57; index += 1) {
    await writeFile(path.join(root, `page-${index}.html`), '<!doctype html>');
  }
  return root;
}

test('accepts a complete static build contract', async () => {
  const root = await makeFixture();
  const result = await verifyBuild(root);
  assert.equal(result.htmlCount, 66);
});

test('rejects an AutoIndex shell without a sealed script hash', async () => {
  const root = await makeFixture({ sealed: false });
  await assert.rejects(
    verifyBuild(root),
    /AutoIndex shell does not contain a sealed script hash/
  );
});
