import { getCollection, type CollectionEntry } from 'astro:content';

export type Thought = CollectionEntry<'thoughts'>;

/** All publishable thoughts, newest first. Drafts are visible only in dev. */
export async function getThoughts(): Promise<Thought[]> {
  const all = await getCollection('thoughts', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function thoughtUrl(thought: Thought): string {
  return `/thoughts/${thought.id}/`;
}

/** Excerpt from frontmatter, or the first real paragraph of the body. */
export function excerptOf(thought: Thought, max = 180): string {
  if (thought.data.excerpt) return thought.data.excerpt;
  const para =
    (thought.body ?? '')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !/^(import|export|#|<|>|```|---|!\[)/.test(p)) ?? '';
  const plain = para
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ');
  return plain.length > max ? `${plain.slice(0, max).replace(/\s+\S*$/, '')}…` : plain;
}

/** Rough reading time, because it's nice to know. */
export function readingMinutes(thought: Thought): number {
  const words = (thought.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}
