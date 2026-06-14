import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const slide = z.object({
  src: z.string(),
  type: z.enum(['image', 'video']).default('image'),
  order: z.number(),
  text: z.string().optional(),
});

const cases = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    years: z.string(),
    order: z.number(),
    heading: z.string(),
    // Banner slides shown on the detail page (one at a time, paginated).
    // The slide with the lowest `order` is the cover used in the case list.
    slides: z.array(slide).min(1),
  }),
});

export const collections = { cases };
