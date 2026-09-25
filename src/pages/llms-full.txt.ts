/**
 * /llms-full.txt: who Brian is, what he's doing now, and every thought in full (see llmstxt.org).
 */
import type { APIRoute } from 'astro';
import { SITE } from '../site.config';
import { getThoughts } from '../lib/thoughts';
import { aboutMarkdown, nowMarkdown, thoughtMarkdown } from '../lib/markdown';

/** Push a Markdown document's headings down one level, so it nests under this file's sections. */
const nest = (md: string) => md.replace(/^(#+) /gm, '#$1 ');

export const GET: APIRoute = async () => {
  const thoughts = await getThoughts();
  const body = `# ${SITE.name}

> ${SITE.description}

${nest(aboutMarkdown())}
${nest(nowMarkdown())}
## Thoughts (full text)

${thoughts.map((t) => thoughtMarkdown(t, 3)).join('\n---\n\n')}`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
