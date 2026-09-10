import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

const reviewMirrorz = readFileSync(
  new URL('./test/fixtures/review-mirrorz.json', import.meta.url)
);

const localReviewFixtures = {
  name: 'local-review-fixtures',
  hooks: {
    'astro:server:setup': ({ server }) => {
      if (process.env.MIRROR_FRONT_REVIEW_FIXTURES !== '1') return;
      server.middlewares.use((request, response, next) => {
        const pathname = request.url?.split('?', 1)[0];
        if (pathname === '/mirrorz.json') {
          response.setHeader('Content-Type', 'application/json');
          response.end(reviewMirrorz);
          return;
        }
        if (
          pathname === '/api/is_campus_network' ||
          pathname === '/api/is_campus_network/'
        ) {
          response.setHeader('Content-Type', 'application/json');
          response.end('1');
          return;
        }
        next();
      });
    },
  },
};

export default defineConfig({
  site: 'https://mirrors.zju.edu.cn',
  output: 'static',
  outDir: './dist',
  publicDir: './static',
  trailingSlash: 'always',
  markdown: {
    // Local MDX code blocks are highlighted by the same client enhancer used
    // for MirrorZ guides. Avoid Shiki's inline dark theme before hydration.
    syntaxHighlight: false,
  },
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    localReviewFixtures,
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.endsWith('/404/') && !page.endsWith('/autoindex/'),
    }),
  ],
});
