# sztamfater.com

My little corner of the internet. Astro, static, built by a human and an AI.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then builds to dist/
npm run preview
```

## Where things live

| I want to…                        | Edit                                    |
| --------------------------------- | --------------------------------------- |
| write a thought                   | add `src/content/thoughts/my-slug.md` (or `.mdx`) |
| update the /now page              | `src/data/now.ts` (bump `updated`)      |
| change name, links, Moby URL      | `src/site.config.ts`                    |
| add a section (things, uses, …)   | new page in `src/pages/`, one line in `NAV` |
| tweak colors / type               | tokens at the top of `src/styles/global.css` |
| regenerate favicon                | `node scripts/make-images.mjs`          |
| social preview (OG) images        | automatic, see `src/pages/og/` + `src/lib/og.ts` |
| visitor counter                   | `netlify/functions/hits.mts`            |
| add a GIF                         | drop it in `public/gifs/`, add a line to `src/data/gifs.ts` |
| redraw the pixel-art GIFs         | `node scripts/make-gifs.mjs`            |

A thought's frontmatter:

```yaml
---
title: The internet used to be more fun.
date: 2026-09-08
updated: 2026-09-12   # optional, when you revise it
excerpt: Optional. Otherwise the first paragraph is used.
tags: [internet]        # optional
cover: ./cover.jpg      # optional, used for link previews
coverAlt: Description   # optional
draft: true             # optional, hidden from the build
---
```

Files starting with `_` are ignored.

Each thought automatically gets its own social preview image (`/og/thoughts/<slug>.png`),
Open Graph + X card tags (with reading time and date labels for Slack/X/Discord unfurls),
`BlogPosting` structured data, and a sitemap `lastmod`. Nothing to do by hand.

## Visitor counter

The homepage "you are visitor no." counter is a Netlify Function (`/api/hits`)
backed by Netlify Blobs. It stores a single number: no IPs, no cookies, no ids.
Each browser session counts once.

It only runs on Netlify. With plain `npm run dev` the counter just shows `------`.
To try it locally, use the Netlify CLI: `npx netlify-cli dev`.

The count lives in the Blobs store `counter`, under the key `visitors`
(value: `{"count": 123}`). You can inspect it in the Netlify UI under Blobs.
