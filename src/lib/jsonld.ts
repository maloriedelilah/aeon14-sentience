// Builds schema.org JSON-LD as ONE @graph with stable @ids so entities cross-reference
// instead of duplicating. Derived from ContentSource -> can't drift from visible content.
import type { Author, Book, Series, Hub, EventItem } from './ContentSource';
import { exactPublicationDate, isFutureRelease } from './date';

const SITE = (path = '') => new URL(path, import.meta.env.SITE).toString();
export const pageUrl = (path: string) => SITE(path.endsWith('/') ? path : `${path}/`);
const absImage = (src?: string) => (src ? new URL(src, import.meta.env.SITE).toString() : undefined);

export const authorId = (slug: string) => `${pageUrl('/about')}#${slug}`;
export const bookId = (slug: string) => `${pageUrl(`/books/${slug}`)}#book`;
export const seriesId = (slug: string) => `${pageUrl(`/series/${slug}`)}#series`;
export const hubId = (slug: string) => `${pageUrl(`/themes/${slug}`)}#hub`;

export function namedStub(id: string, name: string, type = 'Person') {
  return { '@type': type, '@id': id, name };
}

export function authorNode(a: Author) {
  return { '@type': 'Person', '@id': authorId(a.slug), name: a.name,
    alternateName: a.alternateName, description: a.bio,
    url: pageUrl('/about'), image: absImage(a.photo), sameAs: a.sameAs };
}

export function bookNode(
  b: Book,
  opts: {
    series?: { slug: string; name: string };
    authors: { slug: string; name: string }[];
    hubs?: { slug: string; name: string }[];
  },
) {
  const isPartOf = [
    ...(opts.series ? [namedStub(seriesId(opts.series.slug), opts.series.name, 'BookSeries')] : []),
    ...(opts.hubs ?? []).map((h) => namedStub(hubId(h.slug), h.name, 'CollectionPage')),
  ];
  const availabilityStarts = exactPublicationDate(b.datePublished);
  const workExamples = b.editions.map((e) => ({ '@type': 'Book', bookFormat: e.format,
    isbn: e.isbn, potentialAction: undefined,
    offers: { '@type': 'Offer', url: e.url, price: e.price, priceCurrency: e.currency,
      ...(e.asin ? { asin: e.asin } : {}),
      ...(e.sku ? { sku: e.sku } : {}),
      availability: isFutureRelease(b.datePublished)
        ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock',
      ...(isFutureRelease(b.datePublished) && availabilityStarts
        ? { availabilityStarts } : {}) } }));
  return { '@type': 'Book', '@id': bookId(b.slug), name: b.title,
    url: pageUrl(`/books/${b.slug}`),
    ...(b.subtitle ? { alternateName: b.subtitle } : {}),
    author: opts.authors.map((a) => namedStub(authorId(a.slug), a.name)),
    description: b.description,
    inLanguage: b.language,
    ...(b.datePublished ? { datePublished: b.datePublished } : {}),
    genre: b.genres,
    ...(b.cover ? { image: absImage(b.cover) } : {}),
    ...(isPartOf.length > 0 ? { isPartOf } : {}),
    ...(workExamples.length > 0 ? { workExample: workExamples } : {}) };
}

export function seriesNode(
  s: Series,
  members: { id: string; name: string }[],
  authors: { slug: string; name: string }[],
) {
  return { '@type': 'BookSeries', '@id': seriesId(s.slug), name: s.name,
    description: s.description,
    author: authors.map((a) => namedStub(authorId(a.slug), a.name)),
    hasPart: members.map((m) => namedStub(m.id, m.name, 'Book')) };
}

export function seriesReadingOrder(
  s: Series,
  members: { id: string; name: string; position?: number | null }[],
) {
  return { '@type': 'ItemList', '@id': `${seriesId(s.slug)}-reading-order`,
    name: `${s.name} reading order`, numberOfItems: members.length,
    itemListElement: members
      .filter((m) => m.position != null)
      .map((m) => ({ '@type': 'ListItem', position: m.position, item: namedStub(m.id, m.name, 'Book') })) };
}

export function breadcrumbNode(items: { name: string; url?: string }[]) {
  return { '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name,
      ...(it.url ? { item: it.url } : {}) })) };
}

export function hubPageExtra(h: Hub, members: { id: string; name: string }[]) {
  return {
    about: h.about.map((t) => ({ '@type': 'DefinedTerm', name: t.term, sameAs: t.sameAs })),
    mainEntity: { '@type': 'ItemList', numberOfItems: members.length,
      itemListElement: members.map((m, i) => ({ '@type': 'ListItem',
        position: i + 1, item: namedStub(m.id, m.name, 'Book') })) },
  };
}

export const eventId = (slug: string) => `${pageUrl('/events')}#${slug}`;
export function eventNode(e: EventItem) {
  return { '@type': 'Event', '@id': eventId(e.slug), name: e.name,
    description: e.description,
    startDate: e.startDate.toISOString(),
    ...(e.endDate ? { endDate: e.endDate.toISOString() } : {}),
    ...(e.location ? { location: { '@type': 'Place', name: e.location } } : {}),
    ...(e.url ? { url: e.url } : {}),
    eventAttendanceMode: `https://schema.org/${
      e.eventAttendanceMode === 'online' ? 'OnlineEventAttendanceMode'
        : e.eventAttendanceMode === 'mixed' ? 'MixedEventAttendanceMode'
          : 'OfflineEventAttendanceMode'
    }` };
}

export function graph(nodes: unknown[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
