/** /now.md: the /now page as plain Markdown, for AI assistants. */
import type { APIRoute } from 'astro';
import { nowMarkdown, markdownResponse } from '../lib/markdown';

export const GET: APIRoute = () => markdownResponse(nowMarkdown());
