/**
 * IndexNow: after each production deploy goes live, tell Bing (which also feeds
 * ChatGPT search and Copilot), Yandex, Seznam and others which URLs exist, so new
 * and updated pages get picked up in minutes instead of weeks. https://www.indexnow.org
 *
 * The key is proven by public/<key>.txt. This never fails a deploy.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const onSuccess = async ({ constants, inputs, utils }) => {
  if (process.env.CONTEXT !== 'production') {
    console.log('IndexNow: not a production deploy, skipping.');
    return;
  }
  try {
    const dir = constants.PUBLISH_DIR;
    const index = await readFile(join(dir, 'sitemap-index.xml'), 'utf8');
    const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    const urls = [];
    for (const path of sitemaps) {
      const xml = await readFile(join(dir, path), 'utf8');
      urls.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
    }
    if (!urls.length) return;
    const host = new URL(urls[0]).host;
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: inputs.key, keyLocation: `https://${host}/${inputs.key}.txt`, urlList: urls }),
    });
    console.log(`IndexNow: submitted ${urls.length} URLs, got HTTP ${res.status}.`);
    utils.status.show({ title: 'IndexNow', summary: `Submitted ${urls.length} URLs (HTTP ${res.status}).` });
  } catch (error) {
    console.log(`IndexNow: ping failed (${error.message}); the deploy is fine.`);
  }
};
