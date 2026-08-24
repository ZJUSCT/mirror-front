import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'manifest.webmanifest',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'schemas/frontend-mirrors-v1.schema.json',
  'docs/debian/index.html',
  'en/docs/debian/index.html',
  'docs/almalinux/index.html',
  'en/docs/almalinux/index.html',
  'docs/crates.io-index.git/index.html',
  'en/docs/crates.io-index.git/index.html',
  'fancy-index/before.html',
  'fancy-index/after.html',
];

export async function verifyBuild(root) {
  for (const relativePath of REQUIRED_FILES) {
    await access(path.join(root, relativePath));
  }

  const before = await readFile(
    path.join(root, 'fancy-index/before.html'),
    'utf8'
  );
  const after = await readFile(
    path.join(root, 'fancy-index/after.html'),
    'utf8'
  );

  if (!before.includes('<div id="fancy-start"></div>')) {
    throw new Error('FancyIndex prefix is missing the fancy-start marker');
  }
  if (before.includes('<div id="fancy-end"></div>')) {
    throw new Error(
      'FancyIndex prefix unexpectedly contains the fancy-end marker'
    );
  }
  if (!after.startsWith('<div id="fancy-end"></div>')) {
    throw new Error(
      'FancyIndex suffix does not begin with the fancy-end marker'
    );
  }
  if (
    before.includes('FANCY_INDEX_SCRIPT_HASH') ||
    !before.includes("script-src 'sha256-")
  ) {
    throw new Error('FancyIndex prefix does not contain a sealed script hash');
  }

  const composed = `${before}<table id="list"><tbody><tr><td>fixture</td></tr></tbody></table>${after}`;
  if (
    !composed.includes('<table id="list">') ||
    !composed.endsWith('</html>')
  ) {
    throw new Error(
      'FancyIndex fragments do not compose around an NGINX table'
    );
  }

  const entries = await readdir(root, { recursive: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.join(root, entry);
    if ((await stat(candidate)).isFile()) files.push(entry);
  }

  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  if (htmlFiles.length < 60) {
    throw new Error(
      `Expected at least 60 generated HTML files, found ${htmlFiles.length}`
    );
  }

  for (const htmlFile of htmlFiles) {
    const source = await readFile(path.join(root, htmlFile), 'utf8');
    if (/href=["']https:\/\/mirrors\.zjusct\.io\//.test(source)) {
      throw new Error(`Staging data link leaked into ${htmlFile}`);
    }
    if (
      /\b(?:src|srcset)=["'][^"']*https:\/\/mirrors\.zju\.edu\.cn\//.test(
        source
      )
    ) {
      throw new Error(`Production asset URL leaked into ${htmlFile}`);
    }
    if (
      source.includes('ZJUMIRRORDOCSTEMPLATE') ||
      source.includes('FANCY_INDEX_SCRIPT_HASH')
    ) {
      throw new Error(`Build placeholder leaked into ${htmlFile}`);
    }
  }

  return {
    fileCount: files.length,
    htmlCount: htmlFiles.length,
    beforeBytes: Buffer.byteLength(before),
    afterBytes: Buffer.byteLength(after),
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || 'dist');
  const result = await verifyBuild(root);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
