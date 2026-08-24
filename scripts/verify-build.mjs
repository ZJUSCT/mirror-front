import { access, readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED_FILES = [
  'index.html',
  '404.html',
  'manifest.webmanifest',
  'sitemap-index.xml',
  'sitemap-0.xml',
  'docs/debian/index.html',
  'en/docs/debian/index.html',
  'docs/almalinux/index.html',
  'en/docs/almalinux/index.html',
  'docs/crates.io-index.git/index.html',
  'en/docs/crates.io-index.git/index.html',
  'autoindex/index.html',
];

export async function verifyBuild(root) {
  for (const relativePath of REQUIRED_FILES) {
    await access(path.join(root, relativePath));
  }

  const shell = await readFile(path.join(root, 'autoindex/index.html'), 'utf8');
  if (!shell.includes('id="autoindex-list"')) {
    throw new Error('AutoIndex shell is missing the listing table');
  }
  if (shell.includes('/_astro/')) {
    throw new Error(
      'AutoIndex shell is not self-contained: an /_astro/ asset reference remains'
    );
  }
  if (
    shell.includes('AUTOINDEX_SCRIPT_HASH') ||
    !shell.includes("script-src 'sha256-")
  ) {
    throw new Error('AutoIndex shell does not contain a sealed script hash');
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
      source.includes('AUTOINDEX_SCRIPT_HASH')
    ) {
      throw new Error(`Build placeholder leaked into ${htmlFile}`);
    }
  }

  return {
    fileCount: files.length,
    htmlCount: htmlFiles.length,
    shellBytes: Buffer.byteLength(shell),
  };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  const root = path.resolve(process.argv[2] || 'dist');
  const result = await verifyBuild(root);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
