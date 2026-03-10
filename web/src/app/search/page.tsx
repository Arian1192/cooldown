import type { Metadata } from 'next';
import Link from 'next/link';

import { ContentList } from '@/components/ContentList';
import { TrackEventOnRender } from '@/components/TrackEventOnRender';
import { Card, CardCaption, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import type { CitySlug, ContentType } from '@/lib/content';
import { labelForCity, labelForType, searchItems } from '@/lib/content';
import { logServerEvent } from '@/lib/observability/server';
import { getRequestLocale } from '@/lib/requestLocale';
import { basicOg } from '@/lib/seo';
import { collectionPageJsonLd } from '@/lib/structuredData';

const CONTENT_TYPES: ContentType[] = [
  'discover',
  'street-art',
  'interviews',
  'reviews',
];

const CITIES: CitySlug[] = ['barcelona', 'madrid'];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return basicOg({
    title: 'Search',
    description:
      locale === 'en'
        ? 'Search posts and filter by type/city.'
        : 'Busca contenido y filtra por tipo o ciudad.',
    canonicalPath: '/search',
    locale,
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; city?: string }>;
}) {
  const locale = await getRequestLocale();
  const { q, type, city } = await searchParams;

  const typeFilter = CONTENT_TYPES.includes(type as ContentType)
    ? (type as ContentType)
    : undefined;
  const cityFilter = CITIES.includes(city as CitySlug)
    ? (city as CitySlug)
    : undefined;
  const query = q?.trim() ?? '';

  logServerEvent('search_performed', {
    source: 'search-page',
    query: query || null,
    type: typeFilter ?? null,
    city: cityFilter ?? null,
    locale,
  });

  const results = await searchItems({ q, type: typeFilter, city: cityFilter, locale });
  const jsonLd = collectionPageJsonLd({
    title: 'Search',
    description:
      locale === 'en'
        ? 'Search posts and filter by type/city.'
        : 'Busca contenido y filtra por tipo o ciudad.',
    path: '/search',
    locale,
  });

  const captionParts: string[] = [];
  if (q?.trim()) captionParts.push(`Query: "${q.trim()}"`);
  if (typeFilter) captionParts.push(`Type: ${labelForType(typeFilter, locale)}`);
  if (cityFilter) captionParts.push(`City: ${labelForCity(cityFilter)}`);

  return (
    <div className="space-y-5">
      <TrackEventOnRender
        name="search_performed"
        payload={{
          query: query || null,
          type: typeFilter ?? null,
          city: cityFilter ?? null,
          resultCount: results.length,
          locale,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Search"
        caption={
          captionParts.length
            ? captionParts.join(' · ')
            : locale === 'en'
              ? 'Search title, excerpt, tags, and city.'
              : 'Busca por titulo, extracto, tags y ciudad.'
        }
      />

      <Card>
        <CardTitle>Filters</CardTitle>
        <CardCaption>
          {locale === 'en'
            ? 'This is URL-driven. Use links below to apply filters.'
            : 'Esta vista usa la URL. Usa los enlaces para aplicar filtros.'}
        </CardCaption>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted">
              Content type
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                href={{ pathname: '/search', query: { q, city } }}
              >
                All
              </Link>
              {CONTENT_TYPES.map((t) => (
                <Link
                  key={t}
                  className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                  href={{ pathname: '/search', query: { q, type: t, city } }}
                >
                  {labelForType(t, locale)}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted">
              City
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                href={{ pathname: '/search', query: { q, type } }}
              >
                All
              </Link>
              {CITIES.map((c) => (
                <Link
                  key={c}
                  className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                  href={{ pathname: '/search', query: { q, type, city: c } }}
                >
                  {labelForCity(c)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {results.length ? (
        <div className="space-y-3">
          <div className="text-xs text-muted">
            {results.length} results
          </div>
          <ContentList items={results} locale={locale} />
        </div>
      ) : (
        <Card>
          <CardTitle>Nothing found</CardTitle>
          <CardCaption>
            {locale === 'en'
              ? 'Try removing filters or adjusting the query. Examples:'
              : 'Prueba quitando filtros o ajustando la consulta. Ejemplos:'}
            <span className="ml-2 inline-flex flex-wrap gap-2">
              <Link className="underline" href={{ pathname: '/search', query: { q: 'mural' } }}>
                mural
              </Link>
              <Link
                className="underline"
                href={{ pathname: '/search', query: { q: 'weekly', city: 'madrid' } }}
              >
                weekly + madrid
              </Link>
            </span>
          </CardCaption>
        </Card>
      )}
    </div>
  );
}
