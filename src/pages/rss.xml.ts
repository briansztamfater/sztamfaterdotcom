import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as mdxRenderer } from '@astrojs/mdx/container-renderer';
import { SITE } from '../site.config';
import { getThoughts, thoughtUrl, excerptOf } from '../lib/thoughts';

/** Root-relative links and images don't work in feed readers; make them absolute. */
const absolutize = (html: string) => html.replace(/(href|src)="\/(?!\/)/g, `$1="${SITE.url}/`);

export async function GET(context: APIContext) {
  const thoughts = await getThoughts();
  // render each post's Markdown/MDX to HTML, so feed readers get the whole thing
  const container = await AstroContainer.create({ renderers: await loadRenderers([mdxRenderer()]) });

  const items = await Promise.all(
    thoughts.map(async (t) => {
      const { Content } = await render(t);
      const html = absolutize(await container.renderToString(Content));
      return {
        title: t.data.title,
        pubDate: t.data.date,
        description: excerptOf(t, 400),
        content: html,
        link: thoughtUrl(t),
        categories: t.data.tags,
        customData: `<dc:creator>${SITE.name}</dc:creator>`,
      };
    }),
  );

  return rss({
    title: `${SITE.name}: thoughts`,
    description: 'Things I’m thinking about, written down before I change my mind.',
    site: context.site ?? SITE.url,
    items,
    xmlns: { atom: 'http://www.w3.org/2005/Atom', dc: 'http://purl.org/dc/elements/1.1/' },
    customData: [
      '<language>en</language>',
      `<atom:link href="${new URL('rss.xml', SITE.url).href}" rel="self" type="application/rss+xml"/>`,
      `<image><url>${SITE.url}/apple-touch-icon.png</url><title>${SITE.name}: thoughts</title><link>${SITE.url}/</link></image>`,
    ].join(''),
  });
}
