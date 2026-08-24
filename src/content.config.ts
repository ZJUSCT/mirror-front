import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const githubUsername = z
  .string()
  .regex(
    /^(?!-)(?!.*--)[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/,
    'must be a valid GitHub username'
  );

const announcements = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './news' }),
  schema: z.object({
    title: z.string().min(1),
    name: z.string().min(1),
    author: githubUsername,
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

const specialPages = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/content/special-pages',
  }),
  schema: z.object({
    title: z.string().min(1),
    lead: z.string().min(1),
  }),
});

export const collections = { announcements, specialPages };
