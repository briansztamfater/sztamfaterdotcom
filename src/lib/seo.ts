/** Structured data (schema.org JSON-LD) so search engines know who and what this is. */
import { BIO, BOOKS, SITE, SOCIALS } from '../site.config';

export type JsonLd = Record<string, unknown>;

/** Size of the generated social preview images (see src/lib/og.ts). */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const person = (): JsonLd => ({
  '@type': 'Person',
  '@id': `${SITE.url}/#person`,
  name: SITE.name,
  url: SITE.url,
  description: BIO.headline,
  jobTitle: SITE.moby.role,
  worksFor: { '@id': `${SITE.url}/#moby` },
  knowsAbout: BIO.topics,
  sameAs: SOCIALS.map((s) => s.href),
  homeLocation: { '@type': 'Place', name: 'Buenos Aires, Argentina' },
});

export const moby = (): JsonLd => ({
  '@type': 'Organization',
  '@id': `${SITE.url}/#moby`,
  name: SITE.moby.name,
  url: SITE.moby.url,
  description: SITE.moby.blurb.replace(/^a /, 'A '),
});

export const books = (): JsonLd[] =>
  BOOKS.map((b, i) => ({
    '@type': 'Book',
    '@id': `${SITE.url}/#book-${i + 1}`,
    name: b.title,
    description: b.description,
    author: { '@id': `${SITE.url}/#person` },
    publisher: { '@type': 'Organization', name: b.publisher },
    inLanguage: b.language,
    isbn: b.isbn,
    url: b.links[0].href,
    sameAs: b.links.map((l) => l.href),
  }));

/** Who Brian is: the person, where he works, and what he's written. Include wherever person is referenced. */
export const identity = (): JsonLd[] => [person(), moby(), ...books()];

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
