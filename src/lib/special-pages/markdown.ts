import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { CollectionEntry } from 'astro:content';

type SpecialPageEntry = CollectionEntry<'specialPages'>;

function sourcePath(entry: SpecialPageEntry): string {
  const [, locale, id] = entry.id.match(/^(zh|en)\/(.+?)(?:\.mdx?)?$/) ?? [];
  if (!locale || !id) throw new Error(`Invalid special page id: ${entry.id}`);
  return path.join(process.cwd(), 'src/content/special-pages', locale, `${id}.mdx`);
}

/** Export the author-written MDX as Markdown while dropping build-only imports. */
export async function exportSpecialPageMarkdown(
  entry: SpecialPageEntry,
  _locale: 'zh' | 'en'
): Promise<string> {
  let body = await readFile(sourcePath(entry), 'utf8');
  body = body
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/^import\s+[^;]+;\s*$/gm, '')
    .replace(/<ImageGallery[\s\S]*?\/>/g, '')
    .replace(/<ContributorList[\s\S]*?\/>/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\bclassName=/g, 'class=')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return [
    `# ${entry.data.title}`,
    '',
    entry.data.lead,
    '',
    body,
    '',
  ].join('\n');
}
