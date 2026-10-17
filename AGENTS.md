# AGENTS.md

Instructions for AI coding agents working on **sztamfater.com**, Brian Sztamfater's personal homepage.
Read this before changing anything. When you add or change content, use the checklists below so nothing gets out of sync.

## What this is

- A static **Astro + TypeScript** site deployed on **Netlify**. No framework UI, no CMS, no database.
- Design: the **early-2000s personal web**, specifically the GameWinners.com look (circa 2003): white page, black **Verdana**, navy links (`#000090`) that get a yellow highlight on hover, khaki panels (`#EEEECC` / `#BBBB99`), gray boxes (`#F0F0F0` / `#999`), bold red (`#CC0000`) headings, raised gray buttons, pixel art. Light mode only, on purpose.
- Tokens live at the top of `src/styles/global.css`. Don't restyle the site, add dark mode, or swap fonts unless asked.
- **Twelve languages.** English is the original and lives at the root (`/thoughts/...`); Spanish, Portuguese, Italian, French, German, Russian, Hebrew, Arabic, Japanese, Chinese and Korean live under their code (`/es/thoughts/...`). The list is `src/i18n/locales.ts`. Hebrew and Arabic render right-to-left. A few lines of JS on English pages send first-time visitors to their browser's language; picking a language from the switcher is remembered in that browser. Translations are made by an AI and say so (translated posts carry a note linking the English original).

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

1. **Never write in Brian's voice without being asked.** Thoughts are his. Don't invent opinions, bios, job history, achievements, testimonials or metrics. His role at Moby is **Mobile / Web Lead**, never "founder", "CEO" or "CTO". If you're asked to draft a post, say it's a draft, and add `draft: true` unless told otherwise.
2. **Keep the credits honest.** The site says it was "built by a human and an AI" and "the opinions are all human". Never claim it's "handmade" or "built by hand".
3. **No tracking.** The footer has a "ZERO TRACKERS" badge and the About page says "No cookies, no analytics, no tracking". If you're asked to add analytics or any third-party script, **also update those claims** (the badge in `src/components/Footer.astro`, and `about.colophon`, `home.oneNumber` and `home.ticker` in every `src/i18n/<lang>.ts`) and tell Brian.
4. **No ripped copyrighted assets** (game sprites, music, logos). The GIFs are original tributes. Anything from elsewhere needs a `credit` in `src/data/gifs.ts`.
5. Keep JavaScript minimal. If you add meaningful JS, update the colophon on the About page ("…and a few lines of JavaScript").
6. **Every language stays in sync.** All visible text comes from `src/i18n/<lang>.ts`, typed against `src/i18n/en.ts`: add a string to English and the build fails until every language has it. Never hardcode English in a component or view. Content that lives in `src/data/` and `src/site.config.ts` is translated in the `content` section of each dictionary, keyed by its English original (so a missing translation just shows English). Thoughts are translated file by file (see the checklist). AI translations are fine, that's how all of them were made, but keep the meaning, the tone and the jokes, and don't add anything Brian didn't say. Brian can proofread Spanish; assume nobody proofreads the rest, so be careful.

## What updates automatically

For every thought: the post page (in every language: the translation when `src/content/thoughts-i18n/<lang>/<slug>.md` exists, otherwise the English text with a "not translated yet" note), the `/thoughts` list, the homepage "Latest Thoughts" table, the NEW! badge (for 30 days, see `NEW_DAYS` in `src/lib/thoughts.ts`), its social preview image (`/og/thoughts/<slug>.png`), its Markdown copy (`/thoughts/<slug>.md`), the page `<title>` (format lives in `src/components/Head.astro`), Open Graph/X tags, `BlogPosting` JSON-LD, the RSS feed (full text), the sitemap (+ `lastmod` and hreflang alternates for every language), the `hreflang` links and `og:locale` tags, `/llms.txt`, `/llms-full.txt`, and the thought counts on the homepage and in OG images.

On every production deploy, the IndexNow plugin (`netlify/plugins/indexnow/`) pings Bing & co. with all sitemap URLs. Its key is in `netlify.toml` and must match the file `public/<key>.txt`; don't delete that file.

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
5. **Translate it** into every language: one file per language at `src/content/thoughts-i18n/<lang>/<slug>.md` (same filename **and extension** as the original; `.mdx` stays `.mdx`). Frontmatter is only `title` and, if the original has one, `excerpt`; date, tags, cover and draft status come from the English file. Keep Markdown and HTML (`<mark>`, `<aside class="note">`, `**Term.**` list items, links) intact. Hebrew and Arabic are right-to-left. If a translation is genuinely not wanted yet, skip the file: the translated site shows the English text with a note. Translation conventions are in the "Translating" section below.

### 🔁 Revising a thought

- Add `updated: YYYY-MM-DD` to its frontmatter. That feeds the "updated" note on the page, `article:modified_time`, JSON-LD `dateModified`, the unfurl label and sitemap `lastmod`. Don't change `date`.
- Apply the same change to every translation in `src/content/thoughts-i18n/*/<slug>.md`.

### 📍 Updating /now

1. Edit `src/data/now.ts`. `value: null` shows "… (still deciding)"; `onHome: true` also shows the row in the homepage sidebar.
2. **Bump `updated`** and keep the exact format `updated: new Date('YYYY-MM-DD')`. `astro.config.mjs` reads it with a regex for the sitemap.
3. If the **Building** item changes, check `src/site.config.ts` → `moby` too (and vice versa: the Moby blurb is repeated as the Building note).
4. **Translate** the change in `content.now` of every `src/i18n/<lang>.ts`. Entries are keyed by the item's English `label` and override `label`, `value` and `note`. A new item needs a new key in each language; a renamed label needs its key renamed. Leave `value` out when it's a proper noun (Moby, a game, a book).

### 🖼️ Adding a GIF

1. Drop the file in `public/gifs/` (or draw it in `scripts/make-gifs.mjs` and run the script).
2. Add an entry to `GIFS` in `src/data/gifs.ts` with a descriptive `alt`, a `category`, and either `original: true` or a `credit`/`creditUrl`.
3. New category? Add it to `GIF_CATEGORIES` and to `content.gifCategories` in every `src/i18n/<lang>.ts`.
4. Add the GIF to `content.gifs` in every `src/i18n/<lang>.ts`, keyed by file name: `alt` always, `title` and `note` unless they're proper nouns.
Sizes, dimensions and frame counts are read automatically.

### 🧭 Adding a new section (e.g. things, experiments, games, uses)

This is the one with the most hand-edits. Do all of them:

1. The page as a **view** in `src/views/<Section>View.astro` that takes `lang` and renders `<Base lang title description image jsonLd>` (and `markdown="/<section>.md"` for English only if you add a Markdown copy, see `src/lib/markdown.ts`). Every string it shows comes from `t(lang)`; links to other pages go through `localePath(lang, '/x/')`. Then two thin routes: `src/pages/<section>.astro` (`lang="en"`) and `src/pages/[lang]/<section>.astro` (`getStaticPaths` over `OTHER_LANGS`); copy `now.astro` in both folders.
2. `NAV` in `src/site.config.ts` (adds the header button) with a `key`, and that key under `nav` in every `src/i18n/<lang>.ts`, plus the page's own strings (title, description, headings…) in every dictionary. Add them to `en.ts` first: the `Dict` type then tells you where they're missing.
3. **Preview image:** add an entry in `getStaticPaths` in `src/pages/og/[...slug].png.ts`, and pass `image="/og/<section>.png"` from the page.
4. **Preview nav buttons:** add the section to the button list *and* the `section` union type in `src/lib/og.ts` (the images draw the site's nav).
5. **`/llms.txt`:** add it under "## Pages" in `src/pages/llms.txt.ts` (and a content section if it has items).
6. **Homepage "Coming Soon":** remove it from `home.soon` in every `src/i18n/<lang>.ts` (and link it from the sidebar in `src/views/HomeView.astro` if it fits).
7. If it has its own content collection: add it to `src/content.config.ts`, consider RSS, sitemap `lastmod` (`astro.config.mjs`) and JSON-LD (`src/lib/seo.ts`).
8. README table of "where things live".
9. `/llms.txt` lists the section once (English); translated pages are found through the sitemap and `hreflang`.

### 👤 Changing identity / profile details

| Change | Files |
| --- | --- |
| Moby name, URL, description | `src/site.config.ts` (`moby.blurb`, `moby.short`, `moby.url`), the Building note in `src/data/now.ts`, and `content.moby` + `content.now.Building` in every `src/i18n/<lang>.ts` |
| Role at Moby | `moby.role` in `src/site.config.ts` (feeds JSON-LD `jobTitle`, `/llms.txt`, `/about.md`) |
| Books | `BOOKS` in `src/site.config.ts` (feeds the About page's Books section, `Book` JSON-LD, `/llms.txt`, `/about.md`). Only verified facts: title, publisher, ISBN, links. Description and language label are translated in `content.books` (keyed by ISBN) in every `src/i18n/<lang>.ts` |
| Topics he knows about | `BIO.topics` in `src/site.config.ts` (JSON-LD `knowsAbout`) |
| Email | `EMAIL` / `EMAIL_PARTS` in `src/site.config.ts`. Keep it spelled out (`name [at] gmail [dot] com`); the real address must never appear in the HTML (use `src/components/EmailLink.astro`, which assembles it when someone reaches for the link). Never put it in JSON-LD |
| Social links | `src/site.config.ts` (`SOCIALS`), `public/humans.txt` |
| X/Twitter handle | `SOCIALS`, `twitter:creator` in `src/components/Head.astro`, `public/humans.txt` |
| Location | `SITE.basedIn` in `src/site.config.ts`, `homeLocation` in `src/lib/seo.ts`, Based in in `src/data/now.ts` (+ `content.now['Based in']` in every dictionary) |
| Header slogan ("…since 1991") | `header.slogan` in every `src/i18n/<lang>.ts` **and** `src/lib/og.ts` (drawn into preview images, English only) |
| Site description | `SITE.description` in `src/site.config.ts` (used by RSS, llms.txt and JSON-LD) **and** `site.description` in every `src/i18n/<lang>.ts` (used by the pages; keep each ≤160 characters) |
| Bio | `src/data/about.ts` (Brian's words; used by `/about` and `/about.md`; don't rewrite without being asked), translated in `content.about` of every `src/i18n/<lang>.ts` |
| Roles in the home page title | `site.roles` in every `src/i18n/<lang>.ts` (`BIO.roles` in `src/site.config.ts` is the English source for JSON-LD) |
| Page title format | `fullTitle` in `src/components/Head.astro` (2000s-style, specific part first) |

### 🌍 Translating

- **Where:** UI text in `src/i18n/<lang>.ts` (one file per language, same keys as `en.ts`; the `content` section translates data files, keyed by the English original). Thoughts in `src/content/thoughts-i18n/<lang>/`. The language list, with direction and `hreflang`/Intl codes, in `src/i18n/locales.ts` (mirrored in `LOCALES` in `astro.config.mjs` for the sitemap).
- **Placeholders:** `{n}`-style values are filled by code and `{{rss}}`-style ones become links; keep them, same names, moved to wherever the sentence needs them.
- **Don't translate** names and products (Brian Sztamfater, Moby, Solana, game and book titles, Astro, Verdana, Silkscreen) or the 88×31 badges in the footer (they're pixel art in English on purpose). The logo and the preview images stay English.
- **Right-to-left** (`he`, `ar`): the layout mirrors itself through `dir="rtl"` and logical CSS properties (`margin-inline-start`, not `margin-left`). Use logical properties in new CSS. "Back" arrows point right in those dictionaries.
- **Dates** are formatted by `src/lib/dates.ts` per language (day-first outside English, year-first in Japanese, Chinese and Korean).
- **Adding a language:** add it to `src/i18n/locales.ts` and `LOCALES` in `astro.config.mjs`, create `src/i18n/<code>.ts` from `es.ts`, register it in `DICTS` in `src/i18n/index.ts`, translate the thoughts into `src/content/thoughts-i18n/<code>/`, and build: the routes, switcher, hreflang links, sitemap and redirect script pick it up.
- **Proofreading:** Brian reads English and Spanish. Everything else is unchecked AI output; keep it faithful and plain.

### 🎨 Changing the design

- Colors and type: tokens at the top of `src/styles/global.css`.
- If the header, palette or logo changes, the generated preview images should match: `src/lib/og.ts` draws them (header band, logo, nav buttons, colors).
- Favicons and cursors: `scripts/make-images.mjs`; GIFs: `scripts/make-gifs.mjs`. Re-run after editing.

---

## Before you finish

- `npm run build` passes with 0 errors.
- New or changed pages: one `<h1>`, a `description` of roughly 70–160 characters, alt text on every image.
- New or changed text: present in every `src/i18n/<lang>.ts`; new thoughts translated into `src/content/thoughts-i18n/*/`. Open one translated page (`dist/es/...`) and one right-to-left page (`dist/he/...`) if you touched layout.
- Glance at the relevant `dist/og/*.png` if titles or the header changed.
- Don't commit or push unless asked.
