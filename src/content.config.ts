import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const announcements = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './news' }),
  schema: z.object({
    title: z.string().min(1),
    name: z.string().min(1),
    author: z.string().min(1),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { announcements };
