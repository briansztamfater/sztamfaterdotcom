/**
 * /llms.txt: a plain-Markdown map of the site for AI assistants (see llmstxt.org).
 * Generated at build time, so it's always current.
 */
import type { APIRoute } from 'astro';
import { BOOKS, SITE, SOCIALS } from '../site.config';
import { NOW } from '../data/now';
import { getThoughts, thoughtUrl, excerptOf } from '../lib/thoughts';
import { iso } from '../lib/dates';

export const GET: APIRoute = async () => {
  const thoughts = await getThoughts();
  const u = (path: string) => new URL(path, SITE.url).href;
  const now = NOW.items.filter((i) => i.value).map((i) => `- ${i.label}: ${i.value}${i.note ? ` (${i.note.replace(/\.$/, '')})` : ''}`);

  const body = `# ${SITE.name}

> ${SITE.description}

Brian Sztamfater is an entrepreneur, software engineer, builder and author based in ${SITE.basedIn}, Argentina. He is the ${SITE.moby.role} at [${SITE.moby.name}](${SITE.moby.url}), ${SITE.moby.blurb}. He is also the author of the book *${BOOKS[0].title}* (in ${BOOKS[0].languageLabel}). This is his personal homepage, styled after the early-2000s web. Thoughts, the About page and the Now page have plain Markdown versions (the .md links below).

## Thoughts

${thoughts.map((t) => `- [${t.data.title}](${u(thoughtUrl(t).replace(/\/$/, '.md'))}) (${iso(t.data.date)}): ${excerptOf(t)}`).join('\n')}

## Books

${BOOKS.map((b) => `- *${b.title}* (${b.languageLabel}, ${b.publisher}, ISBN ${b.isbn}): ${b.description} [${b.links[0].label}](${b.links[0].href})`).join('\n')}

## Now (as of ${iso(NOW.updated)}, [full page](${u('/now.md')}))

${now.join('\n')}

## Pages

- [Home](${u('/')}): overview, latest thoughts, what he's up to
- [Thoughts](${u('/thoughts/')}): all posts, newest first
- [Now](${u('/now.md')}): what he's focused on at the moment
- [GIFs](${u('/gifs/')}): a collection of original pixel-art GIFs
- [About](${u('/about.md')}): a short bio, his book, and links

## Elsewhere

${SOCIALS.map((s) => `- [${s.label}](${s.href})`).join('\n')}

## Optional

- [Everything in one file: bio, now, and every thought in full](${u('/llms-full.txt')})
- [RSS feed](${u('/rss.xml')})
`;

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
