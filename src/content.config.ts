import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    years: z.string(),
    order: z.number(),
    cover: z.object({
      type: z.enum(['image', 'video']),
      src: z.string(),
    }),
    heading: z.string(),
  }),
});

export const collections = { cases };
