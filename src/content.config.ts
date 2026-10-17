import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Thoughts: one Markdown or MDX file per post in src/content/thoughts/.
 * The filename becomes the URL: my-post.md -> /thoughts/my-post/
 */
const thoughts = defineCollection({
  loader: glob({ pattern: '[^_]*.{md,mdx}', base: './src/content/thoughts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      /** Optional: when you last revised it. Shows on the page and in link metadata. */
      updated: z.coerce.date().optional(),
      /** Short teaser for lists, RSS and link previews. Falls back to the first paragraph. */
      excerpt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      /** Optional cover image, relative to the post file. Used for social previews. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /** Drafts show up in `npm run dev` but never in the build. */
      draft: z.boolean().default(false),
    }),
});

/**
 * Translations of thoughts: src/content/thoughts-i18n/<lang>/<same-slug>.md (or .mdx).
 * Only the title, the excerpt and the body are translated; date, tags, cover and draft
 * status come from the English original. A thought without a translation is shown in
 * English on the translated site, with a note.
 */
const translations = defineCollection({
  loader: glob({ pattern: '*/[^_]*.{md,mdx}', base: './src/content/thoughts-i18n' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string().optional(),
  }),
});

export const collections = { thoughts, translations };
