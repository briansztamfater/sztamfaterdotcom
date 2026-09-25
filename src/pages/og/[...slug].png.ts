/**
 * Build-time social preview images: /og/index.png, /og/now.png, /og/thoughts/<slug>.png, ...
 * Pages point at these through the `image` prop on <Base>.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { SITE } from '../../site.config';
import { NOW } from '../../data/now';
import { GIFS } from '../../data/gifs';
import { getThoughts, excerptOf } from '../../lib/thoughts';
import { stamp, monthYear } from '../../lib/dates';
import { renderOg, type OgInput } from '../../lib/og';

/** A sprite for each thought, picked by its first tag that has one. */
const TAG_SPRITES: Record<string, string> = {
  ai: 'computer.gif',
  software: 'vb6.gif',
  games: 'black-mage.gif',
  internet: 'globe.gif',
};

export const getStaticPaths = (async () => {
  const thoughts = await getThoughts();
  const pages: { slug: string; og: OgInput }[] = [
    {
      slug: 'index',
      og: {
        kicker: 'personal homepage',
        title: SITE.name,
        subtitle: `I build things, think about things, and occasionally get obsessed with them. Currently building ${SITE.moby.name}.`,
        section: 'home',
        sprite: 'computer.gif',
      },
    },
    {
      slug: 'thoughts',
      og: {
        kicker: `${thoughts.length} thoughts so far`,
        title: 'Thoughts',
        subtitle: 'Things I’m thinking about, written down before I change my mind.',
        section: 'thoughts',
        sprite: 'floppy.gif',
        titleColor: '#cc0000',
      },
    },
    {
      slug: 'now',
      og: {
        kicker: `status report · ${monthYear(NOW.updated)}`,
        title: 'What I’m doing now',
        subtitle: NOW.items
          .filter((i) => i.value)
          .slice(0, 3)
          .map((i) => `${i.label}: ${i.value}`)
          .join(' · '),
        section: 'now',
        sprite: 'hourglass.gif',
        titleColor: '#cc0000',
      },
    },
    {
      slug: 'gifs',
      og: {
        kicker: `${GIFS.length} animated gifs`,
        title: 'GIFs',
        subtitle: 'Computers, consoles, games and the old web. Original pixel art.',
        section: 'gifs',
        sprite: 'black-mage.gif',
        titleColor: '#cc0000',
      },
    },
    {
      slug: 'about',
      og: {
        kicker: 'about',
        title: `Hi, I’m ${SITE.name.split(' ')[0]}.`,
        subtitle: `An entrepreneur, software engineer, builder and author from ${SITE.basedIn}. Currently building ${SITE.moby.name}.`,
        section: 'about',
        sprite: 'mail.gif',
      },
    },
    ...thoughts.map((t) => ({
      slug: `thoughts/${t.id}`,
      og: {
        kicker: `thoughts · ${stamp(t.data.date)}`,
        title: t.data.title,
        subtitle: excerptOf(t, 160),
        footnote: t.data.tags.map((tag) => `#${tag}`).join(' '),
        section: 'thoughts' as const,
        sprite: t.data.tags.map((tag) => TAG_SPRITES[tag]).find(Boolean) ?? 'computer.gif',
      },
    })),
  ];
  return pages.map(({ slug, og }) => ({ params: { slug }, props: { og } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOg((props as { og: OgInput }).og);
  return new Response(new Uint8Array(png), { headers: { 'content-type': 'image/png' } });
};
