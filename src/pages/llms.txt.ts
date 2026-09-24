/**
 * /llms.txt: a plain-Markdown map of the site for AI assistants (see llmstxt.org).
 * Generated at build time, so it's always current.
 */
import type { APIRoute } from 'astro';
import { SITE, SOCIALS } from '../site.config';
import { NOW } from '../data/now';
import { getThoughts, thoughtUrl, excerptOf } from '../lib/thoughts';
import { iso } from '../lib/dates';

export const GET: APIRoute = async () => {
  const thoughts = await getThoughts();
  const u = (path: string) => new URL(path, SITE.url).href;
  const now = NOW.items.filter((i) => i.value).map((i) => `- ${i.label}: ${i.value}${i.note ? ` (${i.note.replace(/\.$/, '')})` : ''}`);

  const body = `# ${SITE.name}

> ${SITE.description}

Brian Sztamfater is a software engineer and builder based in ${SITE.basedIn}, Argentina. He is currently building [${SITE.moby.name}](${SITE.moby.url}), ${SITE.moby.blurb}. This is his personal homepage, styled after the early-2000s web.

## Thoughts

${thoughts.map((t) => `- [${t.data.title}](${u(thoughtUrl(t))}) (${iso(t.data.date)}): ${excerptOf(t)}`).join('\n')}

## Now (as of ${iso(NOW.updated)})

${now.join('\n')}

## Pages

- [Home](${u('/')}): overview, latest thoughts, what he's up to
- [Thoughts](${u('/thoughts/')}): all posts, newest first
- [Now](${u('/now/')}): what he's focused on at the moment
- [GIFs](${u('/gifs/')}): a collection of original pixel-art GIFs
- [About](${u('/about/')}): a short bio and links

## Elsewhere

${SOCIALS.map((s) => `- [${s.label}](${s.href})`).join('\n')}

## Optional

- [Full text of every thought](${u('/llms-full.txt')})
- [RSS feed](${u('/rss.xml')})
`;

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
