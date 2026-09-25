/** /about.md: the About page as plain Markdown, for AI assistants. */
import type { APIRoute } from 'astro';
import { aboutMarkdown, markdownResponse } from '../lib/markdown';

export const GET: APIRoute = () => markdownResponse(aboutMarkdown());
