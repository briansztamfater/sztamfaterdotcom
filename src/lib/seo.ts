/** Structured data (schema.org JSON-LD) so search engines know who and what this is. */
import { SITE, SOCIALS } from '../site.config';

export type JsonLd = Record<string, unknown>;

/** Size of the generated social preview images (see src/lib/og.ts). */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const person = (): JsonLd => ({
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.name,
  url: SITE.url,
  sameAs: SOCIALS.map((s) => s.href),
  homeLocation: { '@type': 'Place', name: 'Buenos Aires, Argentina' },
});

export const website = (): JsonLd => ({
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  name: SITE.domain,
  url: SITE.url,
  description: SITE.description,
  inLanguage: 'en',
  author: { '@id': `${SITE.url}/#person` },
});

/** Wrap one or more nodes in a single @graph document. */
export const graph = (...nodes: JsonLd[]): JsonLd => ({ '@context': 'https://schema.org', '@graph': nodes });
