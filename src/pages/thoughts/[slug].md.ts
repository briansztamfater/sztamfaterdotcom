/** /thoughts/<slug>.md: the post as plain Markdown, for AI assistants. */
import type { APIRoute, GetStaticPaths } from 'astro';
import { getThoughts, type Thought } from '../../lib/thoughts';
import { thoughtMarkdown, markdownResponse } from '../../lib/markdown';

export const getStaticPaths = (async () =>
  (await getThoughts()).map((thought) => ({ params: { slug: thought.id }, props: { thought } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => markdownResponse(thoughtMarkdown((props as { thought: Thought }).thought));
