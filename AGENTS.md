# AGENTS.md

Instructions for AI coding agents working on **sztamfater.com**, Brian Sztamfater's personal homepage.
Read this before changing anything. When you add or change content, use the checklists below so nothing gets out of sync.

## What this is

- A static **Astro + TypeScript** site deployed on **Netlify**. No framework UI, no CMS, no database.
- Design: the **early-2000s personal web**, specifically the GameWinners.com look (circa 2003): white page, black **Verdana**, navy links (`#000090`) that get a yellow highlight on hover, khaki panels (`#EEEECC` / `#BBBB99`), gray boxes (`#F0F0F0` / `#999`), bold red (`#CC0000`) headings, raised gray buttons, pixel art. Light mode only, on purpose.
- Tokens live at the top of `src/styles/global.css`. Don't restyle the site, add dark mode, or swap fonts unless asked.

## Commands

```sh
npm run dev                    # local dev server (http://localhost:4321)
npm run build                  # astro check (types) + build. Must pass with 0 errors.
node scripts/make-images.mjs   # favicons, manifest icons, cursors
node scripts/make-gifs.mjs     # redraws the original pixel-art GIFs in public/gifs/
npx netlify-cli dev            # only needed to test the visitor counter (/api/hits)
```

Always run `npm run build` after a change and fix anything it reports.

## Ground rules

1. **Never write in Brian's voice without being asked.** Thoughts are his. Don't invent opinions, bios, job history, achievements, testimonials or metrics. If you're asked to draft a post, say it's a draft, and add `draft: true` unless told otherwise.
2. **Keep the credits honest.** The site says it was "built by a human and an AI" and "the opinions are all human". Never claim it's "handmade" or "built by hand".
3. **No tracking.** The footer has a "ZERO TRACKERS" badge and the About page says "No cookies, no analytics, no tracking". If you're asked to add analytics or any third-party script, **also update those claims** (`src/components/Footer.astro`, `src/pages/about.astro`, and the ticker in `src/pages/index.astro`) and tell Brian.
4. **No ripped copyrighted assets** (game sprites, music, logos). The GIFs are original tributes. Anything from elsewhere needs a `credit` in `src/data/gifs.ts`.
5. Keep JavaScript minimal. If you add meaningful JS, update the colophon on the About page ("…and a few lines of JavaScript").

## What updates automatically

For every thought: the post page, the `/thoughts` list, the homepage "Latest Thoughts" table, the NEW! badge (for 30 days, see `NEW_DAYS` in `src/lib/thoughts.ts`), its social preview image (`/og/thoughts/<slug>.png`), Open Graph/X tags, `BlogPosting` JSON-LD, the RSS feed (full text), the sitemap (+ `lastmod`), `/llms.txt`, `/llms-full.txt`, and the thought counts on the homepage and in OG images.

Everything below is what does **not** happen by itself.

---

## Checklists

### ✍️ Adding a thought

1. Create `src/content/thoughts/<slug>.md` (or `.mdx` if it needs HTML/components). The filename is the URL.
   ```yaml
   ---
   title: The internet used to be more fun.
   date: 2026-09-08          # YYYY-MM-DD, required
   excerpt: Optional summary for lists, previews, RSS and search (≤160 chars ideal).
   tags: [internet]          # optional
   cover: ./cover.jpg        # optional; replaces the generated preview image
   coverAlt: Description     # required if cover is set
   draft: true               # optional; hidden from the build, visible in dev
   ---
   ```
2. **If it uses a new tag** that deserves its own preview sprite, map it in `TAG_SPRITES` in `src/pages/og/[...slug].png.ts` (first matching tag wins; default is `computer.gif`).
3. Formatting helpers available in posts: a list whose items start with `**Term.**` renders as the cream "criteria" box; `<mark>…</mark>` is the yellow highlighter; `---` makes a red `* * *` break.
4. Build, then look at `dist/og/thoughts/<slug>.png` to check the preview image (title wraps, summary doesn't collide with the footer).

### 🔁 Revising a thought

- Add `updated: YYYY-MM-DD` to its frontmatter. That feeds the "updated" note on the page, `article:modified_time`, JSON-LD `dateModified`, the unfurl label and sitemap `lastmod`. Don't change `date`.

### 📍 Updating /now

1. Edit `src/data/now.ts`. `value: null` shows "… (still deciding)"; `onHome: true` also shows the row in the homepage sidebar.
2. **Bump `updated`** and keep the exact format `updated: new Date('YYYY-MM-DD')`. `astro.config.mjs` reads it with a regex for the sitemap.
3. If the **Building** item changes, check `src/site.config.ts` → `moby` too (and vice versa: the Moby blurb is repeated as the Building note).

### 🖼️ Adding a GIF

1. Drop the file in `public/gifs/` (or draw it in `scripts/make-gifs.mjs` and run the script).
2. Add an entry to `GIFS` in `src/data/gifs.ts` with a descriptive `alt`, a `category`, and either `original: true` or a `credit`/`creditUrl`.
3. New category? Add it to `GIF_CATEGORIES`.
Sizes, dimensions and frame counts are read automatically.

### 🧭 Adding a new section (e.g. things, experiments, games, uses)

This is the one with the most hand-edits. Do all of them:

1. The page(s) in `src/pages/`, using `<Base title description image jsonLd>`.
2. `NAV` in `src/site.config.ts` (adds the header button).
3. **Preview image:** add an entry in `getStaticPaths` in `src/pages/og/[...slug].png.ts`, and pass `image="/og/<section>.png"` from the page.
4. **Preview nav buttons:** add the section to the button list *and* the `section` union type in `src/lib/og.ts` (the images draw the site's nav).
5. **`/llms.txt`:** add it under "## Pages" in `src/pages/llms.txt.ts` (and a content section if it has items).
6. **Homepage "Coming Soon":** remove it from `soon` in `src/pages/index.astro` (and link it from the sidebar if it fits).
7. If it has its own content collection: add it to `src/content.config.ts`, consider RSS, sitemap `lastmod` (`astro.config.mjs`) and JSON-LD (`src/lib/seo.ts`).
8. README table of "where things live".

### 👤 Changing identity / profile details

| Change | Files |
| --- | --- |
| Moby name, URL, description | `src/site.config.ts` (`moby.blurb`, `moby.short`, `moby.url`), the Building note in `src/data/now.ts` |
| Social links | `src/site.config.ts` (`SOCIALS`), `public/humans.txt` |
| X/Twitter handle | `SOCIALS`, `twitter:creator` in `src/components/Head.astro`, `public/humans.txt` |
| Location | `SITE.basedIn` in `src/site.config.ts`, `homeLocation` in `src/lib/seo.ts`, Based in in `src/data/now.ts` |
| Header slogan ("…since 1991") | `src/components/Header.astro` **and** `src/lib/og.ts` (drawn into preview images) |
| Site description | `SITE.description` in `src/site.config.ts` (keep it ≤160 characters) |
| Bio | `src/pages/about.astro` (Brian's words; don't rewrite without being asked) |

### 🎨 Changing the design

- Colors and type: tokens at the top of `src/styles/global.css`.
- If the header, palette or logo changes, the generated preview images should match: `src/lib/og.ts` draws them (header band, logo, nav buttons, colors).
- Favicons and cursors: `scripts/make-images.mjs`; GIFs: `scripts/make-gifs.mjs`. Re-run after editing.

---

## Before you finish

- `npm run build` passes with 0 errors.
- New or changed pages: one `<h1>`, a `description` of roughly 70–160 characters, alt text on every image.
- Glance at the relevant `dist/og/*.png` if titles or the header changed.
- Don't commit or push unless asked.
