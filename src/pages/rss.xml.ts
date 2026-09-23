import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site.config';
import { getThoughts, thoughtUrl, excerptOf } from '../lib/thoughts';

export async function GET(context: APIContext) {
  const thoughts = await getThoughts();
  return rss({
    title: `${SITE.name}: thoughts`,
    description: 'Things I’m thinking about, written down before I change my mind.',
    site: context.site ?? SITE.url,
    items: thoughts.map((t) => ({
      title: t.data.title,
      pubDate: t.data.date,
      description: excerptOf(t, 400),
      link: thoughtUrl(t),
      categories: t.data.tags,
    })),
    customData: `<language>en</language>`,
  });
}
