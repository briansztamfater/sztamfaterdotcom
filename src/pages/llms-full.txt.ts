/**
 * /llms-full.txt: every thought in full, as Markdown, for AI assistants (see llmstxt.org).
 */
import type { APIRoute } from 'astro';
import { SITE } from '../site.config';
import { getThoughts, thoughtUrl } from '../lib/thoughts';
import { iso } from '../lib/dates';

/** MDX can contain imports and small bits of HTML; keep the prose, drop the plumbing. */
const clean = (body: string) =>
  body
    .replace(/^(import|export)\s.*$/gm, '')
    .replace(/<\/?(aside|div|span|mark)[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const GET: APIRoute = async () => {
  const thoughts = await getThoughts();
  const posts = thoughts.map(
    (t) => `## ${t.data.title}

- URL: ${new URL(thoughtUrl(t), SITE.url).href}
- Published: ${iso(t.data.date)}${t.data.updated ? `\n- Updated: ${iso(t.data.updated)}` : ''}${t.data.tags.length ? `\n- Tags: ${t.data.tags.join(', ')}` : ''}

${clean(t.body ?? '')}`,
  );

  const body = `# ${SITE.name}: thoughts (full text)

> ${SITE.description}

${posts.join('\n\n---\n\n')}
`;
  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
