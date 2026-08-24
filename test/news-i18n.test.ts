import { readdir } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

async function newsSlugs(locale: 'en' | 'zh'): Promise<string[]> {
  const directory = new URL(`../news/${locale}/`, import.meta.url);
  return (await readdir(directory))
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => name.replace(/\.mdx?$/, ''))
    .sort();
}

describe('news translations', () => {
  test('keeps English and Chinese announcement slugs paired', async () => {
    expect(await newsSlugs('en')).toEqual(await newsSlugs('zh'));
  });
});
