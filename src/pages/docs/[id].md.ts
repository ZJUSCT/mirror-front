import type { APIRoute } from 'astro';
import {
  loadMirrorDocsMapping,
  loadMirrorzDocument,
} from '../../lib/mirrorz-docs/loader';
import { exportDocumentMarkdown } from '../../lib/mirrorz-docs/markdown';
import type { MirrorzDocument } from '../../lib/mirrorz-docs/types';

export async function getStaticPaths() {
  const mapping = await loadMirrorDocsMapping();
  return Promise.all(
    Object.keys(mapping)
      .sort()
      .map(async (id) => ({
        params: { id },
        props: { document: await loadMirrorzDocument(id) },
      }))
  );
}

export const GET: APIRoute = ({ props }) =>
  new Response(exportDocumentMarkdown(props.document as MirrorzDocument), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
