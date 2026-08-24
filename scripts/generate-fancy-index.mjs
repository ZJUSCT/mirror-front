import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const outputRoot = path.resolve(process.argv[2] || 'dist');
const fancyRoot = path.join(outputRoot, 'fancy-index');
const sourcePath = path.join(fancyRoot, 'index.html');
const startMarker = '<div id="fancy-start"></div>';
const endMarker = '<div id="fancy-end"></div>';

const unsealedSource = await readFile(sourcePath, 'utf8');
const scripts = [
  ...unsealedSource.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g),
];
if (scripts.length !== 1 || !scripts[0]?.[1]) {
  throw new Error('FancyIndex output must contain exactly one inline script');
}
const scriptHash = createHash('sha256').update(scripts[0][1]).digest('base64');
const source = unsealedSource.replace('FANCY_INDEX_SCRIPT_HASH', scriptHash);
if (source === unsealedSource) {
  throw new Error('FancyIndex CSP hash placeholder is missing');
}
const startIndex = source.indexOf(startMarker);
const endIndex = source.indexOf(endMarker);
if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  throw new Error('FancyIndex boundary markers are missing or out of order');
}

await mkdir(fancyRoot, { recursive: true });
await writeFile(sourcePath, source);
await writeFile(path.join(fancyRoot, 'before.html'), source.slice(0, endIndex));
await writeFile(path.join(fancyRoot, 'after.html'), source.slice(endIndex));

const schemaRoot = path.join(outputRoot, 'schemas');
await mkdir(schemaRoot, { recursive: true });
await copyFile(
  path.resolve('schemas', 'frontend-mirrors-v1.schema.json'),
  path.join(schemaRoot, 'frontend-mirrors-v1.schema.json')
);
