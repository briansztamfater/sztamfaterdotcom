// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://sztamfater.com';

/**
 * Languages. Mirrors src/i18n/locales.ts (this file can't import it): English at the root,
 * the rest under /<code>/. `hreflang` values feed the sitemap's alternate links.
 */
const LOCALES = { en: 'en', es: 'es', pt: 'pt', it: 'it', fr: 'fr', de: 'de', ru: 'ru', he: 'he', ar: 'ar', ja: 'ja', zh: 'zh-Hans', ko: 'ko' };
const OTHER_LANGS = Object.keys(LOCALES).filter((l) => l !== 'en');

/**
 * lastmod for each thought in the sitemap: its `updated` date, or else `date`,
 * read straight from the frontmatter (content collections aren't available here).
 */
function thoughtDates() {
  const dir = './src/content/thoughts';
  /** @type {Record<string, string>} */
  const dates = {};
  for (const file of readdirSync(dir)) {
    if (!/\.mdx?$/.test(file) || file.startsWith('_')) continue;
    const front = readFileSync(`${dir}/${file}`, 'utf8').split('---')[1] ?? '';
    const pick = (/** @type {string} */ key) => front.match(new RegExp(`^${key}:\\s*['"]?([0-9-]+)`, 'm'))?.[1];
    const date = pick('updated') ?? pick('date');
    if (date) dates[`${SITE}/thoughts/${file.replace(/\.mdx?$/, '')}/`] = new Date(date).toISOString();
  }
  return dates;
}

const lastmod = thoughtDates();

// pages that change when a thought is added, or when /now is updated
const newest = Object.values(lastmod).sort().at(-1);
if (newest) {
  lastmod[`${SITE}/`] = newest;
  lastmod[`${SITE}/thoughts/`] = newest;
}
const nowUpdated = readFileSync('./src/data/now.ts', 'utf8').match(/updated:\s*new Date\('([0-9-]+)'\)/)?.[1];
if (nowUpdated) lastmod[`${SITE}/now/`] = new Date(nowUpdated).toISOString();

// the same pages in every other language share the English dates
for (const [url, date] of Object.entries(lastmod)) {
  for (const lang of OTHER_LANGS) lastmod[url.replace(`${SITE}/`, `${SITE}/${lang}/`)] = date;
}

export default defineConfig({
  site: SITE,
  i18n: {
    defaultLocale: 'en',
    locales: Object.keys(LOCALES),
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: { defaultLocale: 'en', locales: LOCALES },
      serialize(item) {
        if (lastmod[item.url]) item.lastmod = lastmod[item.url];
        return item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { theme: 'min-light' },
  },
});
