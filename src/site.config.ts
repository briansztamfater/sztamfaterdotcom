/**
 * Everything site-wide lives here. Edit freely.
 */

export const SITE = {
  name: 'Brian Sztamfater',
  domain: 'sztamfater.com',
  url: 'https://sztamfater.com',
  description:
    'Personal homepage of Brian Sztamfater: entrepreneur, software engineer, builder and author from Buenos Aires. Thoughts, a /now page, GIFs, and more.',
  locale: 'en',
  basedIn: 'Buenos Aires',
  since: 2026,
  /** Shown as the one piece of professional context on the site. */
  moby: {
    name: 'Moby',
    blurb: 'a trading app that tracks smart money on Solana, Robinhood Chain, Base and BNB Chain',
    /** Brian's role there (not founder!). */
    role: 'Mobile / Web Lead',
    /** Short version for tight spots, like the header box. */
    short: 'smart money trading app',
    /** Leave empty to render Moby as plain text instead of a link. */
    url: 'https://moby.win',
  },
} as const;

/** One-line, factual bio used in structured data and llms.txt. */
export const BIO = {
  /** How Brian describes himself. Used in the home page title. */
  roles: ['Entrepreneur', 'Software Engineer', 'Builder', 'Author'],
  headline: 'Entrepreneur, software engineer, builder and author from Buenos Aires.',
  /** Topics, from the About page. Used as schema.org `knowsAbout`. */
  topics: ['Software engineering', 'Mobile apps', 'Web development', 'Artificial intelligence', 'Video games', 'Crypto'],
};

export const BOOKS = [
  {
    title: 'Licenciatura autodidacta',
    description: 'A book about self-directed learning: forty tips for building a career on your own terms, without depending on a university degree.',
    language: 'es',
    languageLabel: 'Spanish',
    publisher: 'Tinta Libre Ediciones',
    isbn: '9789878241272',
    links: [
      { label: 'Amazon', href: 'https://www.amazon.com.mx/Licenciatura-autodidacta-Brian-Sztamfater-ebook/dp/B0C49K53VX' },
      { label: 'Tinta Libre', href: 'https://www.tintalibre.com.ar/book/583/Licenciatura_autodidacta' },
    ],
  },
] as const;

/**
 * Main navigation. To add a section later (things, experiments, games, uses…)
 * create the page and add one line here.
 */
export const NAV = [
  { href: '/thoughts/', label: 'thoughts' },
  { href: '/now/', label: 'now' },
  { href: '/gifs/', label: 'gifs' },
  { href: '/about/', label: 'about' },
] as const;

export const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/briansztamfater', handle: '@briansztamfater' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/bstamfa/', handle: 'in/bstamfa' },
  { label: 'X', href: 'https://x.com/briansztamfater', handle: '@briansztamfater' },
] as const;
