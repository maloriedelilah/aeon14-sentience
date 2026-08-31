import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const edition = z.object({
  format: z.enum(['ebook', 'paperback', 'hardcover', 'audiobook']),
  isbn: z.string().optional(),
  asin: z.string().optional(),
  sku: z.string().optional(),
  retailer: z.string(),
  url: z.string().url(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'price must be a plain decimal number as a string, e.g. "17.99" (no currency symbols or commas)'),
  currency: z.string().regex(/^[A-Z]{3}$/, 'currency must be a 3-letter ISO 4217 code, e.g. "USD"').default('USD'),
}).refine(
  (e) => Boolean(e.isbn || e.asin || e.sku),
  { message: 'edition needs at least one canonical identifier (isbn, asin, or sku)' },
);

const comp = z.object({
  name: z.string(),
  hook: z.string().min(20, 'Comps need a descriptive hook, not a bare name.'),
  sameAs: z.array(z.string().url()).optional(),
});

const publicationDate = z.string().regex(
  /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/,
  'datePublished must preserve known precision as YYYY, YYYY-MM, or YYYY-MM-DD',
);

const author = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/author' }),
  schema: ({ image }) => z.object({
    slug: z.string(),
    name: z.string(),
    alternateName: z.array(z.string()).optional(),
    bio: z.string(),
    photo: image().optional(),
    url: z.string().url(),
    sameAs: z.array(z.string().url()).default([]),
    email: z.string().email().optional(),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/books' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    slug: z.string(),
    description: z.string().min(1),
    cover: z.union([image(), z.string().url()]).optional(),
    authors: z.array(reference('author')).min(1),
    series: reference('series').optional(),
    seriesPosition: z.number().int().optional(),
    // Older or very new titles occasionally have trustworthy series/story
    // metadata before a clean publication date is exposed publicly. Omit it
    // rather than fabricating one; when present, preserve the source precision.
    datePublished: publicationDate.optional(),
    language: z.string().default('en'),
    genres: z.array(z.string()).default([]),
    // Commerce enrichment is independent of catalog completeness. A verified
    // title can ship with zero offers and gain them later as prices/ids are
    // confirmed. Offers that ARE present remain strict and machine-usable.
    editions: z.array(edition).default([]),
    comps: z.array(comp).default([]),
  }),
});

const series = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/series' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    cover: image().optional(),
    authors: z.array(reference('author')).min(1),
    comps: z.array(comp).default([]),
  }),
});

const hubs = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/hubs' }),
  schema: () => z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    about: z.array(z.object({ term: z.string(), sameAs: z.string().url().optional() })).min(1),
    books: z.array(reference('books')).min(1),
    comps: z.array(comp).default([]),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.{md,yaml}', base: './src/content/events' }),
  schema: () => z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    location: z.string().optional(),
    url: z.string().url().optional(),
    eventAttendanceMode: z.enum(['online', 'offline', 'mixed']).default('offline'),
  }),
});

const legal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/legal' }),
  schema: () => z.object({
    title: z.string(),
    slug: z.enum(['privacy', 'terms']),
    updated: z.coerce.date(),
  }),
});

export const collections = { author, books, series, hubs, events, legal };
