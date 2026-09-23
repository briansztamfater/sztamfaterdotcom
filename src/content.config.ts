import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Thoughts: one Markdown or MDX file per post in src/content/thoughts/.
 * The filename becomes the URL: my-post.md -> /thoughts/my-post/
 */
const thoughts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/thoughts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
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

export const collections = { thoughts };
