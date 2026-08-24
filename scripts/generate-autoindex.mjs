import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// The AutoIndex shell is a complete, self-contained page: the release
// pipeline burns exactly this one file into the serving container, so every
// render-critical asset is inlined here. The post-processing order matters:
// assets are inlined first, then the (unchanged) inline scripts are sealed
// with CSP hashes, because only the final built output can be hashed.
// Only the Latin Poppins WOFF2 faces used by the shell are retained and
// inlined. Astro emits Devanagari, Latin Extended, WOFF, and WOFF2 variants;
// carrying all of them would add hundreds of kilobytes to every listing
// response, while leaving their /_astro/ URLs would break on publish origins.
const outputRoot = path.resolve(process.argv[2] || 'dist');
const shellPath = path.join(outputRoot, 'autoindex', 'index.html');

let source = await readFile(shellPath, 'utf8');

const missingAssets = [];
const readAsset = async (url) => {
  const relativePath = url.replace(/^\//, '');
  try {
    return await readFile(path.join(outputRoot, relativePath));
  } catch {
    missingAssets.push(url);
    return null;
  }
};

const inlineShellFonts = async (css) => {
  let result = '';
  let cursor = 0;
  for (const match of css.matchAll(/@font-face\{[^{}]*\}/g)) {
    result += css.slice(cursor, match.index);
    cursor = match.index + match[0].length;
    const woff2 = match[0].match(
      /url\((\/_astro\/poppins-latin-(?!ext-)[^)]+\.woff2)\)/
    );
    if (!woff2) continue;
    const font = await readAsset(woff2[1]);
    if (font === null) continue;
    result += match[0].replace(
      /src:[^;]+;/,
      `src:url(data:font/woff2;base64,${font.toString('base64')}) format("woff2");`
    );
  }
  return result + css.slice(cursor);
};

// Inline hashed stylesheets as <style> elements (CSP style-src already
// allows 'unsafe-inline').
for (const match of [
  ...source.matchAll(/<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)">/g),
]) {
  const css = await readAsset(match[1]);
  if (css === null) continue;
  const selfContainedCss = await inlineShellFonts(css.toString('utf8'));
  source = source.replace(match[0], () => `<style>${selfContainedCss}</style>`);
}

// Inline hashed images as data: URIs (CSP img-src already allows data:).
const IMAGE_MIME_TYPES = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
};
for (const match of [
  ...source.matchAll(/src="(\/_astro\/[^"]+\.([a-z0-9]+))"/g),
]) {
  const mimeType = IMAGE_MIME_TYPES[match[2]];
  if (!mimeType) continue;
  const asset = await readAsset(match[1]);
  if (asset === null) continue;
  source = source.replace(
    match[0],
    () => `src="data:${mimeType};base64,${asset.toString('base64')}"`
  );
}

if (missingAssets.length > 0) {
  throw new Error(
    `AutoIndex shell references missing build assets: ${missingAssets.join(', ')}`
  );
}

const scripts = [
  ...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
];
if (scripts.length === 0 || scripts.some((script) => !script[1])) {
  throw new Error('AutoIndex shell must contain inline scripts');
}
const scriptHashes = scripts
  .map(
    (script) =>
      `'sha256-${createHash('sha256').update(script[1]).digest('base64')}'`
  )
  .join(' ');
const sealedSource = source.replace('AUTOINDEX_SCRIPT_HASHES', scriptHashes);
if (sealedSource === source) {
  throw new Error('AutoIndex CSP hash placeholders are missing');
}

await writeFile(shellPath, sealedSource);
