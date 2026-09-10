import { readdir } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

const contentRoot = new URL('../src/content/special-pages/', import.meta.url);

async function pageSlugs(locale: 'en' | 'zh'): Promise<string[]> {
  return (await readdir(new URL(`${locale}/`, contentRoot)))
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => name.replace(/\.mdx?$/, ''))
    .sort();
}

describe('special-page content', () => {
  test('keeps matching English and Chinese page files', async () => {
    expect(await pageSlugs('en')).toEqual([
      'about',
      'container-images',
      'faq',
      'history',
    ]);
    expect(await pageSlugs('zh')).toEqual(await pageSlugs('en'));
  });
});
