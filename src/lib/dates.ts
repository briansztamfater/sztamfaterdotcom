import { type Lang, DEFAULT_LANG, localeOf } from '../i18n/locales';

const pad = (n: number) => String(n).padStart(2, '0');
const intl = (lang: Lang) => localeOf(lang).intl;

/** 09.23.26 — the little stamp used in lists. American order in English, day first elsewhere, year first in East Asia. */
export function stamp(date: Date, lang: Lang = DEFAULT_LANG): string {
  const d = pad(date.getUTCDate());
  const m = pad(date.getUTCMonth() + 1);
  const y = String(date.getUTCFullYear()).slice(-2);
  if (lang === 'en') return `${m}.${d}.${y}`;
  if (lang === 'ja' || lang === 'zh' || lang === 'ko') return `${y}.${m}.${d}`;
  return `${d}.${m}.${y}`;
}

/** 23 September 2026 */
export function longDate(date: Date, lang: Lang = DEFAULT_LANG): string {
  return date.toLocaleDateString(intl(lang), { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** September 2026 */
export function monthYear(date: Date, lang: Lang = DEFAULT_LANG): string {
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : intl(lang), { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

/** Sep 17, 2026 */
export function shortDate(date: Date, lang: Lang = DEFAULT_LANG): string {
  return date.toLocaleDateString(lang === 'en' ? 'en-US' : intl(lang), { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

export function iso(date: Date): string {
  return date.toISOString().slice(0, 10);
}
