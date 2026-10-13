import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { exportSpecialPageMarkdown } from '../../lib/special-pages/markdown';

export async function getStaticPaths() {
  const entries = await getCollection('specialPages');
  return entries
    .filter((entry) => entry.id.startsWith('en/'))
    .map((entry) => ({
      params: { id: entry.id.slice(3).replace(/\.mdx?$/, '') },
      props: { entry },
    }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(await exportSpecialPageMarkdown(props.entry, 'en'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
