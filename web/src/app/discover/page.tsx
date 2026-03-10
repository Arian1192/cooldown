import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/PageHeader';
import { SortToggle } from '@/components/ui/SortToggle';
import { getRequestLocale } from '@/lib/requestLocale';
import { WeeklyDiscoverCard } from '@/components/WeeklyDiscoverCard';
import { basicOg } from '@/lib/seo';
import { collectionPageJsonLd } from '@/lib/structuredData';
import { getWeeklyDiscoverItems } from '@/lib/weeklyDiscover';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return basicOg({
    title: 'Weekly Discover',
    description:
      locale === 'en'
        ? 'One electronic music gem every week.'
        : 'Una joya de la musica electronica cada semana.',
    canonicalPath: '/discover',
    locale,
  });
}

export default async function DiscoverListPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const locale = await getRequestLocale();
  const { order } = await searchParams;
  const sortOrder: 'asc' | 'desc' =
    order === 'asc' ? 'asc' : 'desc';

  const items = await getWeeklyDiscoverItems(locale);
  const sorted =
    sortOrder === 'desc' ? [...items].reverse() : items;
  const jsonLd = collectionPageJsonLd({
    title: 'Weekly Discover',
    description:
      locale === 'en'
        ? 'One electronic music gem every week.'
        : 'Una joya de la musica electronica cada semana.',
    path: '/discover',
    locale,
  });

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Weekly Discover"
        caption={
          locale === 'en'
            ? 'One electronic music gem every week - Techno, House, Deep House.'
            : 'Una joya de la musica electronica - Techno, House, Deep House - cada semana.'
        }
      />

      {/* Sort control */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            {sorted.length}{' '}
            {locale === 'en'
              ? sorted.length === 1
                ? 'episode'
                : 'episodes'
              : sorted.length === 1
                ? 'episodio'
                : 'episodios'}
          </h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <SortToggle current={sortOrder} />
      </div>

      {/* Weekly curated picks */}
      {sorted.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sorted.map((item) => (
            <WeeklyDiscoverCard key={item.slug} item={item} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted">
          {locale === 'en'
            ? 'No episodes published yet. Check back soon.'
            : 'Aun no hay episodios publicados. Vuelve pronto.'}
        </p>
      )}
    </div>
  );
}
