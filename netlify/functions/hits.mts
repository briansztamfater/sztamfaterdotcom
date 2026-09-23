/**
 * The visitor counter. One number in Netlify Blobs, nothing else.
 * No IPs, no cookies, no user data: POST adds one, GET just reads.
 *
 *   GET  /api/hits  -> { "count": 1234 }
 *   POST /api/hits  -> { "count": 1235 }
 */
import { getStore } from '@netlify/blobs';

const KEY = 'visitors';
const MAX_TRIES = 8;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export default async (req: Request) => {
  const store = getStore({ name: 'counter', consistency: 'strong' });

  if (req.method === 'GET') {
    const current = await store.get(KEY, { type: 'json' });
    return json({ count: Number(current?.count ?? 0) });
  }

  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  // Only count visits coming from the site itself, not from random scripts on other pages.
  if (req.headers.get('sec-fetch-site') === 'cross-site') return json({ error: 'nope' }, 403);

  // Compare-and-swap, so two visitors arriving at once don't overwrite each other.
  for (let i = 0; i < MAX_TRIES; i++) {
    const entry = await store.getWithMetadata(KEY, { type: 'json' });
    const next = Number(entry?.data?.count ?? 0) + 1;
    const { modified } = !entry
      ? await store.setJSON(KEY, { count: next }, { onlyIfNew: true })
      : entry.etag
        ? await store.setJSON(KEY, { count: next }, { onlyIfMatch: entry.etag })
        : // `netlify dev`'s local blob emulator doesn't return etags; production always does.
          await store.setJSON(KEY, { count: next });
    if (modified) return json({ count: next });
    // someone else won the race; back off a little and retry
    await new Promise((r) => setTimeout(r, Math.random() * 40 * (i + 1)));
  }

  return json({ error: 'busy, try again' }, 503);
};

export const config = { path: '/api/hits' };
