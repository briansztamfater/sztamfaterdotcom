/**
 * Everything site-wide lives here. Edit freely.
 */

export const SITE = {
  name: 'Brian Sztamfater',
  domain: 'sztamfater.com',
  url: 'https://sztamfater.com',
  description:
    'The personal homepage of Brian Sztamfater, a software engineer and builder from Buenos Aires. Thoughts, a /now page, GIFs, and whatever else. Currently building Moby.',
  locale: 'en',
  basedIn: 'Buenos Aires',
  since: 2026,
  /** Shown as the one piece of professional context on the site. */
  moby: {
    name: 'Moby',
    blurb: 'a trading app that tracks smart money on Solana, Robinhood Chain, Base and BNB Chain',
    /** Short version for tight spots, like the header box. */
    short: 'smart money trading app',
    /** Leave empty to render Moby as plain text instead of a link. */
    url: 'https://moby.win',
  },
} as const;

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
