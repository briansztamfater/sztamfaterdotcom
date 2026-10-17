/**
 * English: the original text of the site, and the shape every other language has to match.
 * `{name}`-style placeholders are filled in by the templates; keep them in translations.
 * `{{home}}`-style placeholders become links (see `fill` in src/i18n/index.ts).
 *
 * `content` holds translations of things that live in src/data/ and src/site.config.ts.
 * English leaves it empty: the originals are the source of truth.
 */

export const en = {
  site: {
    /** Site-wide description (meta tags). Keep it under about 160 characters. */
    description:
      'Personal homepage of Brian Sztamfater: entrepreneur, software engineer, builder and author from Buenos Aires. Thoughts, a /now page, GIFs, and more.',
    /** How Brian describes himself. Used in the home page title: "Brian Sztamfater | A, B, C & D". */
    roles: ['Entrepreneur', 'Software Engineer', 'Builder', 'Author'],
    /** Joins the last role in the title: "Builder & Author". */
    and: '&',
    imageAlt: '{domain}, the personal website of {name}',
  },

  a11y: {
    skip: 'skip to content',
    mainNav: 'Main',
    sidebar: 'Sidebar',
    elsewhere: 'Elsewhere',
    badges: 'Badges',
    languages: 'Languages',
    homepage: '{name}, personal homepage',
  },

  header: {
    bookmark: 'press {{key}} to bookmark this site!',
    slogan: "the internet's #1 source of brian sztamfater since 1991",
    building: 'currently building...',
    checkItOut: '» CHECK IT OUT «',
    home: 'HOME',
  },

  nav: {
    thoughts: 'thoughts',
    now: 'now',
    gifs: 'gifs',
    about: 'about',
  },

  footer: {
    credits1: 'built by a human and an AI.',
    credits2: 'the opinions are all human.',
    email: 'email',
    anyBrowser: 'Viewable with any browser. Remember those?',
    /** The greeting next to the visitor number. `{n}` is the number. */
    first: 'first time here? hi.',
    firstNo: "first time here? hi. you're visitor no. {n}.",
    back: 'welcome back.',
    backNo: 'welcome back, visitor no. {n}.',
    languages: 'this page in other languages',
  },

  home: {
    welcome: 'Welcome to my homepage!',
    tagline: 'I build things, think about things, and occasionally get obsessed with them. This is where I put some of it.',
    currently: 'CURRENTLY:',
    building: 'building',
    updated: 'UPDATED!',
    lastUpdate: 'last update:',
    ticker: [
      'welcome to my little corner of the internet',
      'under construction, forever',
      'no cookies, no pop-ups, no newsletter',
      'thoughts added whenever',
      'made in {city}',
      'thanks for stopping by',
    ],
    latestThoughts: 'Latest Thoughts',
    viewAll: 'view all »',
    nothingYet: 'Nothing yet. Soon.',
    siteStats: 'Site Stats',
    visitorNo: 'you are visitor no.',
    oneNumber: '(one number, no tracking)',
    localTime: 'local time',
    thoughts: 'thoughts',
    onlineSince: 'online since',
    /** "6:07pm in BA" */
    inBA: 'in BA',
    rightNow: 'Right Now',
    moreNow: 'more on my /now page »',
    comingSoon: 'Coming Soon',
    soon: ['things', 'experiments', 'games', 'uses'],
    underConstruction1: 'these sections are',
    underConstruction2: 'under construction',
    elsewhere: 'Elsewhere',
    aboutSite: 'About this site',
    aboutSiteText: 'This is my little corner of the internet. No particular purpose. Just somewhere to put things.',
  },

  thoughts: {
    title: 'Thoughts',
    description: 'Things Brian Sztamfater is thinking about, written down before he changes his mind.',
    kicker: '~/thoughts',
    /** `{{rss}}` becomes the RSS link, labelled `rssFeed`. */
    lede: "Things I'm thinking about, written down before I change my mind. Software, AI, games, the internet, and whatever else has my attention this week. Newest first. There's an {{rss}}, if you're one of us.",
    rssFeed: 'RSS feed',
    nothingYet: 'Nothing here yet. Soon.',
    read: 'read →',
    date: 'Date',
    thought: 'Thought',
    new: 'new!',
    fresh: 'fresh off the keyboard',
  },

  thought: {
    back: '← thoughts',
    aboutPost: 'About this post',
    updated: 'updated',
    minRead: '{n} min read',
    readingTime: 'Reading time',
    published: 'Published',
    updatedLabel: 'Updated',
    replyPrompt: 'thoughts on this?',
    replyLink: 'tell me on x',
    keepReading: 'keep reading',
    moreThoughts: 'More thoughts',
    older: 'older',
    newer: 'newer',
    imageAlt: 'A thought by {name}: {title}',
    /** Shown above translated posts. `{{original}}` becomes a link to the English version, labelled `original`. */
    translated: 'Translated from English by an AI; the opinions are still human. {{original}}',
    original: 'Read the original',
    /** Shown when a post has no translation yet. */
    untranslated: "This one hasn't been translated yet, so here it is in English.",
  },

  now: {
    title: 'Now',
    description: 'What Brian Sztamfater is up to right now, as of {month}.',
    statusReport: 'status report',
    lastUpdated: 'last updated',
    stillDeciding: '(still deciding)',
    /** `{date}` is a long date. */
    lastUpdatedLong: 'Last updated {date}.',
    /** `{{nowPage}}` becomes a link to nownownow.com, labelled `nowPage`. */
    aboutNow:
      "This is a {{nowPage}}: a snapshot of what I'm focused on at this point in my life. If it looks stale, I'm probably too busy doing the things on it.",
    nowPage: 'now page',
  },

  gifs: {
    title: 'GIFs',
    description: 'A small collection of animated GIFs: computers, consoles, games and the old web. Original pixel art.',
    lede: 'A small collection of animated GIFs, the way every homepage used to have one. Computers, consoles, games, and the old web.',
    fine: "The pixel art here was drawn for this site (with an AI holding the pencil). They're tributes, not official sprites. Click one to see the file.",
    categories: 'GIF categories',
    top: 'top ↑',
    open: 'Open {file}',
    frames: '{n} frames',
    via: 'via',
  },

  about: {
    title: 'About',
    description:
      'Brian Sztamfater is an entrepreneur, software engineer, builder and author from Buenos Aires. Currently building Moby.',
    hello: 'hello!',
    currentlyBuilding: 'Currently building',
    books: 'books',
    elsewhere: 'elsewhere',
    thisSite: 'this site',
    /** `{{astro}}` becomes a link to astro.build, labelled "Astro". */
    colophon:
      "Built with {{astro}}, pair-programmed with an AI (I had the opinions, it did most of the typing). Set in Verdana, like it's 2003, with a little Silkscreen for the tiny pixel bits. No cookies, no analytics, no tracking. Just HTML, CSS, and a few lines of JavaScript (one of them picks your language).",
  },

  notFound: {
    title: 'Not found',
    description: 'This page wandered off.',
    code: 'error 404',
    heading: 'This page wandered off.',
    /** `{{home}}` and `{{thoughts}}` become links, labelled `home` and `thoughts`. */
    body: 'It might have never existed, or I moved it and forgot to leave a note. Sorry about that. Try the {{home}}, or the {{thoughts}}.',
    home: 'front page',
    thoughts: 'thoughts',
  },

  /**
   * Translations of content that lives elsewhere (src/data/*.ts, src/site.config.ts).
   * Keyed by the English original, so a missing entry just falls back to English.
   */
  content: {
    /** src/data/about.ts */
    about: undefined as undefined | { intro: string; paragraphs: string[] },
    /** src/site.config.ts -> SITE.moby.blurb / SITE.moby.short */
    moby: undefined as undefined | { blurb: string; short: string },
    /** src/data/now.ts, keyed by the English `label`. */
    now: {} as Record<string, { label?: string; value?: string; note?: string }>,
    /** src/data/gifs.ts -> GIF_CATEGORIES, keyed by id. */
    gifCategories: {} as Record<string, string>,
    /** src/data/gifs.ts -> GIFS, keyed by file name. */
    gifs: {} as Record<string, { title?: string; note?: string; alt?: string }>,
    /** src/site.config.ts -> BOOKS, keyed by ISBN. */
    books: {} as Record<string, { description?: string; languageLabel?: string }>,
  },
};

export type Dict = typeof en;
