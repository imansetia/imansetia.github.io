import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Catatan: satu file Markdown per catatan di src/content/notes/.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lang: z.enum(['id', 'en']),
    summary: z.string(),
    translationOf: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
