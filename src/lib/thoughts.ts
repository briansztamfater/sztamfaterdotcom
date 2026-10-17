import { getCollection, type CollectionEntry } from 'astro:content';
import { type Lang, DEFAULT_LANG, localePath } from '../i18n/locales';

export type ThoughtEntry = CollectionEntry<'thoughts'>;
export type TranslationEntry = CollectionEntry<'translations'>;

/**
 * A thought in one language. For English it's just the original; for other languages
 * the title, excerpt and body come from src/content/thoughts-i18n/<lang>/<id>.md when
 * that file exists, and from the English original (with `translated: false`) when not.
 */
export interface Thought {
  id: string;
  lang: Lang;
  translated: boolean;
  data: ThoughtEntry['data'];
  body: string;
  /** What to `render()`: the translation, or the English original. */
  entry: ThoughtEntry | TranslationEntry;
  original: ThoughtEntry;
}

/** All publishable thoughts, newest first. Drafts are visible only in dev. */
export async function getThoughts(lang: Lang = DEFAULT_LANG): Promise<Thought[]> {
  const all = await getCollection('thoughts', ({ data }) => import.meta.env.DEV || !data.draft);
  all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const translations = lang === DEFAULT_LANG ? [] : await getCollection('translations', (e) => e.id.startsWith(`${lang}/`));
  return all.map((original) => {
    const tr = translations.find((e) => e.id === `${lang}/${original.id}`);
    return {
      id: original.id,
      lang,
      translated: lang === DEFAULT_LANG || Boolean(tr),
      data: tr ? { ...original.data, title: tr.data.title, excerpt: tr.data.excerpt } : original.data,
      body: (tr ?? original).body ?? '',
      entry: tr ?? original,
      original,
    };
  });
}

/** Thoughts younger than this get the "NEW!" sticker. */
export const NEW_DAYS = 30;

/** When a thought stops being new. */
export function newUntil(thought: Thought): Date {
  return new Date(thought.data.date.valueOf() + NEW_DAYS * 864e5);
}

export function isNew(thought: Thought, now = Date.now()): boolean {
  return now < newUntil(thought).valueOf();
}

/** The thought's URL in its own language: /thoughts/x/ or /es/thoughts/x/ */
export function thoughtUrl(thought: Thought, lang: Lang = thought.lang): string {
  return localePath(lang, `/thoughts/${thought.id}/`);
}

/**
 * Excerpt from frontmatter, or the opening prose of the body. Keeps adding
 * paragraphs until there's enough to make a decent search/preview snippet.
 */
export function excerptOf(thought: Thought, max = 160, min = 100): string {
  if (thought.data.excerpt) return thought.data.excerpt;
  const paras = thought.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^(import|export|#|<|>|```|---|!\[|- |\* |\d+\. )/.test(p))
    .map((p) =>
      p
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/<[^>]+>/g, '')
        .replace(/[*_`~]/g, '')
        .replace(/\s+/g, ' '),
    );
  let plain = '';
  for (const p of paras) {
    plain = plain ? `${plain} ${p}` : p;
    if (plain.length >= min) break;
  }
  return plain.length > max ? `${plain.slice(0, max).replace(/\s+\S*$/, '')}…` : plain;
}

/** Chinese, Japanese and Korean text has no spaces to count, so those characters count on their own. */
const CJK = /[぀-ヿ㐀-䶿一-鿿가-힯]/g;

export function wordCount(thought: Thought): number {
  const cjk = (thought.body.match(CJK) ?? []).length;
  const words = thought.body.replace(CJK, ' ').split(/\s+/).filter(Boolean).length;
  return words + cjk;
}

/** Rough reading time, because it's nice to know. */
export function readingMinutes(thought: Thought): number {
  const cjk = (thought.body.match(CJK) ?? []).length;
  const words = thought.body.replace(CJK, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230 + cjk / 400));
}
