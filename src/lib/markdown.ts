/** Plain-Markdown versions of pages, for AI assistants (/thoughts/<slug>.md, /about.md, /now.md, llms-full.txt). */
import { BOOKS, SITE, SOCIALS } from '../site.config';
import { ABOUT } from '../data/about';
import { NOW } from '../data/now';
import { thoughtUrl, type Thought } from './thoughts';
import { iso, longDate } from './dates';

export const abs = (path: string) => new URL(path, SITE.url).href;

/** MDX can contain imports and small bits of HTML; keep the prose, drop the plumbing. */
export const cleanBody = (body: string) =>
  body
    .replace(/^(import|export)\s.*$/gm, '')
    // note boxes become blockquotes
    .replace(/<aside[^>]*>([\s\S]*?)<\/aside>/g, (_, inner: string) =>
      inner
        .trim()
        .split('\n')
        .map((l) => `> ${l.trim()}`)
        .join('\n'),
    )
    .replace(/<\/?(div|span|mark)[^>]*>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const markdownResponse = (body: string) =>
  new Response(body, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });

/** A thought's metadata block + body. `level` is the heading depth for its title. */
export function thoughtMarkdown(t: Thought, level = 1): string {
  const meta = [
    `- Author: ${SITE.name}`,
    `- URL: ${abs(thoughtUrl(t))}`,
    `- Published: ${iso(t.data.date)}`,
    t.data.updated ? `- Updated: ${iso(t.data.updated)}` : '',
    t.data.tags.length ? `- Tags: ${t.data.tags.join(', ')}` : '',
  ].filter(Boolean);
  return `${'#'.repeat(level)} ${t.data.title}\n\n${meta.join('\n')}\n\n${cleanBody(t.body ?? '')}\n`;
}

export function aboutMarkdown(): string {
  const books = BOOKS.map(
    (b) => `- *${b.title}* (${b.languageLabel}, ${b.publisher}, ISBN ${b.isbn}): ${b.description} ${b.links.map((l) => `[${l.label}](${l.href})`).join(' · ')}`,
  );
  return `# About ${SITE.name}

${ABOUT.intro}

${ABOUT.paragraphs.join('\n\n')}

Currently ${SITE.moby.role} at [${SITE.moby.name}](${SITE.moby.url}), ${SITE.moby.blurb}.

## Books

${books.join('\n')}

## Elsewhere

${SOCIALS.map((s) => `- [${s.label}](${s.href})`).join('\n')}

Source: ${abs('/about/')}
`;
}

export function nowMarkdown(): string {
  const rows = NOW.items.map(
    (i) => `- **${i.label}:** ${i.value ?? '(still deciding)'}${i.note ? ` (${i.note.replace(/\.$/, '')})` : ''}`,
  );
  return `# What ${SITE.name} is doing now

Last updated: ${longDate(NOW.updated)}

${rows.join('\n')}

Source: ${abs('/now/')}
`;
}
