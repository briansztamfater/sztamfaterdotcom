/**
 * Translations. `t(lang)` returns the dictionary for a language (see en.ts for the shape),
 * and the `localized*` helpers overlay a language's `content` translations on the English
 * data in src/data/ and src/site.config.ts.
 */
import { BOOKS, SITE } from '../site.config';
import { ABOUT } from '../data/about';
import { NOW, type NowItem } from '../data/now';
import { GIFS, GIF_CATEGORIES, type Gif } from '../data/gifs';
import { en, type Dict } from './en';
import { es } from './es';
import { pt } from './pt';
import { it } from './it';
import { fr } from './fr';
import { de } from './de';
import { ru } from './ru';
import { he } from './he';
import { ar } from './ar';
import { ja } from './ja';
import { zh } from './zh';
import { ko } from './ko';
import { type Lang, DEFAULT_LANG } from './locales';

export * from './locales';
export type { Dict };

const DICTS: Record<Lang, Dict> = { en, es, pt, it, fr, de, ru, he, ar, ja, zh, ko };

export const t = (lang: Lang = DEFAULT_LANG): Dict => DICTS[lang] ?? en;

/** "hello {name}" + { name: 'x' } -> "hello x" */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
}

/**
 * Split a template on its `{{link}}` placeholders, so a component can render the
 * pieces with real elements in between: "Try the {{home}}." -> ['Try the ', {key:'home'}, '.']
 */
export function parts(template: string): (string | { key: string })[] {
  return template
    .split(/(\{\{\w+\}\})/)
    .filter(Boolean)
    .map((piece) => {
      const m = piece.match(/^\{\{(\w+)\}\}$/);
      return m ? { key: m[1] } : piece;
    });
}

/** Just the surrounding `{{links}}` dropped, for plain-text contexts. */
export const plain = (template: string) => template.replace(/\{\{(\w+)\}\}/g, '').replace(/\s+/g, ' ').trim();

// ---- content overlays --------------------------------------------------------

export function localizedAbout(lang: Lang) {
  return t(lang).content.about ?? ABOUT;
}

export function localizedMoby(lang: Lang) {
  const m = t(lang).content.moby;
  return { ...SITE.moby, blurb: m?.blurb ?? SITE.moby.blurb, short: m?.short ?? SITE.moby.short };
}

export function localizedNow(lang: Lang): { updated: Date; items: NowItem[] } {
  const tr = t(lang).content.now;
  return {
    updated: NOW.updated,
    items: NOW.items.map((item) => {
      const o = tr[item.label];
      if (!o) return item;
      return {
        ...item,
        label: o.label ?? item.label,
        value: item.value === null ? null : (o.value ?? item.value),
        note: item.note ? (o.note ?? item.note) : item.note,
      };
    }),
  };
}

export function localizedGifCategories(lang: Lang) {
  const tr = t(lang).content.gifCategories;
  return GIF_CATEGORIES.map((c) => ({ ...c, label: tr[c.id] ?? c.label }));
}

export function localizeGif<G extends Gif>(gif: G, lang: Lang): G {
  const o = t(lang).content.gifs[gif.file];
  if (!o) return gif;
  return { ...gif, title: o.title ?? gif.title, note: gif.note ? (o.note ?? gif.note) : gif.note, alt: o.alt ?? gif.alt };
}

export const localizedGifs = (lang: Lang) => GIFS.map((g) => localizeGif(g, lang));

export function localizedBooks(lang: Lang) {
  const tr = t(lang).content.books;
  return BOOKS.map((b) => {
    const o = tr[b.isbn];
    return { ...b, description: o?.description ?? b.description, languageLabel: o?.languageLabel ?? b.languageLabel };
  });
}
