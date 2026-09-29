import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Keep hashed assets shared between directory pages. Script hashes and SRI
// allow only this build's code, without trusting arbitrary mirrored scripts
// on the same origin through a broad script-src 'self' policy.
const outputRoot = path.resolve(process.argv[2] || 'dist');
const shellPath = path.join(outputRoot, 'autoindex', 'index.html');
let source = await readFile(shellPath, 'utf8');
// Move the large decorative mirror logos into a shared SVG sprite as well.
// Only a small <use> reference remains in each directory's HTML response.
const icons = [
  ...source.matchAll(
    /<svg([^>]*data-mirror-icon="([^"]+)"[^>]*)>([\s\S]*?)<\/svg>/g
  ),
];
if (icons.length) {
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg">${icons.map((icon) => `<symbol id="${icon[2]}" viewBox="${icon[1].match(/viewBox="([^"]+)"/)[1]}">${icon[3]}</symbol>`).join('')}</svg>`;
  const digest = createHash('sha256').update(sprite).digest('hex').slice(0, 16);
  const url = `/_astro/autoindex-icons.${digest}.svg`;
  await writeFile(path.join(outputRoot, url.slice(1)), sprite);
  for (const icon of icons)
    source = source.replace(
      icon[0],
      `<svg${icon[1]}><use href="${url}#${icon[2]}"></use></svg>`
    );
}

const hashes = new Set();
const hash = (body) =>
  `sha256-${createHash('sha256').update(body).digest('base64')}`;

for (const match of [
  ...source.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g),
]) {
  const src = match[1].match(/\bsrc="([^\"]+)"/);
  if (src) {
    if (!src[1].startsWith('/_astro/'))
      throw new Error(`Unexpected script URL: ${src[1]}`);
    const digest = hash(await readFile(path.join(outputRoot, src[1].slice(1))));
    hashes.add(`'${digest}'`);
    source = source.replace(
      match[0],
      `<script${match[1]} integrity="${digest}">${match[2]}</script>`
    );
  } else if (match[2]) {
    hashes.add(`'${hash(match[2])}'`);
  }
}
if (!hashes.size || !source.includes('AUTOINDEX_SCRIPT_HASHES')) {
  throw new Error('AutoIndex scripts or CSP hash placeholder are missing');
}
await writeFile(
  shellPath,
  source.replace('AUTOINDEX_SCRIPT_HASHES', [...hashes].join(' '))
);
