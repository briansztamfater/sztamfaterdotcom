/**
 * The languages this site speaks. English is the original and lives at the root
 * (/thoughts/...); every other language lives under its code (/es/thoughts/...).
 *
 * To add a language: add it here, create src/i18n/<code>.ts (copy en.ts) and register
 * it in src/i18n/index.ts. Thoughts are translated one by one in src/content/thoughts-i18n/<code>/.
 */

export const LOCALES = [
  { code: 'en', name: 'English', dir: 'ltr', html: 'en', og: 'en_US', intl: 'en-GB', short: 'EN' },
  { code: 'es', name: 'Español', dir: 'ltr', html: 'es', og: 'es_ES', intl: 'es', short: 'ES' },
  { code: 'pt', name: 'Português', dir: 'ltr', html: 'pt', og: 'pt_BR', intl: 'pt-BR', short: 'PT' },
  { code: 'it', name: 'Italiano', dir: 'ltr', html: 'it', og: 'it_IT', intl: 'it', short: 'IT' },
  { code: 'fr', name: 'Français', dir: 'ltr', html: 'fr', og: 'fr_FR', intl: 'fr', short: 'FR' },
  { code: 'de', name: 'Deutsch', dir: 'ltr', html: 'de', og: 'de_DE', intl: 'de', short: 'DE' },
  { code: 'ru', name: 'Русский', dir: 'ltr', html: 'ru', og: 'ru_RU', intl: 'ru', short: 'RU' },
  { code: 'he', name: 'עברית', dir: 'rtl', html: 'he', og: 'he_IL', intl: 'he', short: 'HE' },
  { code: 'ar', name: 'العربية', dir: 'rtl', html: 'ar', og: 'ar_AR', intl: 'ar-u-nu-latn', short: 'AR' },
  { code: 'ja', name: '日本語', dir: 'ltr', html: 'ja', og: 'ja_JP', intl: 'ja', short: 'JA' },
  { code: 'zh', name: '中文', dir: 'ltr', html: 'zh-Hans', og: 'zh_CN', intl: 'zh-CN', short: 'ZH' },
  { code: 'ko', name: '한국어', dir: 'ltr', html: 'ko', og: 'ko_KR', intl: 'ko', short: 'KO' },
] as const;

export type Lang = (typeof LOCALES)[number]['code'];
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LANG: Lang = 'en';
export const LANGS = LOCALES.map((l) => l.code) as Lang[];
/** Every language except English, for the /[lang]/ routes. */
export const OTHER_LANGS = LANGS.filter((l) => l !== DEFAULT_LANG);

export const localeOf = (lang: Lang): Locale => LOCALES.find((l) => l.code === lang) ?? LOCALES[0];

export const isLang = (s: string | undefined): s is Lang => LANGS.includes(s as Lang);

/** /thoughts/ -> /es/thoughts/ (English stays unprefixed). */
export function localePath(lang: Lang, path: string): string {
  return lang === DEFAULT_LANG ? path : `/${lang}${path}`;
}

/** /es/thoughts/x/ -> { lang: 'es', path: '/thoughts/x/' } */
export function splitPath(pathname: string): { lang: Lang; path: string } {
  const m = pathname.match(/^\/([a-z]{2})(\/.*)?$/);
  if (m && isLang(m[1]) && m[1] !== DEFAULT_LANG) return { lang: m[1], path: m[2] || '/' };
  return { lang: DEFAULT_LANG, path: pathname };
}
