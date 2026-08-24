import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mirrors.zju.edu.cn',
  output: 'static',
  outDir: './dist',
  publicDir: './static',
  trailingSlash: 'always',
  build: {
    inlineStylesheets: 'auto',
  },
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) =>
        !page.endsWith('/404/') && !page.endsWith('/autoindex/'),
    }),
  ],
});
