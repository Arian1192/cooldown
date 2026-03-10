import type { Metadata } from 'next';

import { PageHeader } from '@/components/ui/PageHeader';
import { SortToggle } from '@/components/ui/SortToggle';
import { WeeklyDiscoverCard } from '@/components/WeeklyDiscoverCard';
import { basicOg } from '@/lib/seo';
import { collectionPageJsonLd } from '@/lib/structuredData';
import { getWeeklyDiscoverItems } from '@/lib/weeklyDiscover';

export const metadata: Metadata = basicOg({
  title: 'Weekly Discover',
  description: 'Una joya de la música electrónica, cada semana.',
  canonicalPath: '/discover',
});

export default async function DiscoverListPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const sortOrder: 'asc' | 'desc' =
    order === 'asc' ? 'asc' : 'desc';

  const items = await getWeeklyDiscoverItems();
  const sorted =
    sortOrder === 'asc' ? [...items].reverse() : items;
  const jsonLd = collectionPageJsonLd({
    title: 'Weekly Discover',
    description: 'Una joya de la música electrónica, cada semana.',
    path: '/discover',
  });

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Weekly Discover"
        caption="Una joya de la música electrónica — Techno, House, Deep House — cada semana."
      />

      {/* Sort control */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
            {sorted.length} {sorted.length === 1 ? 'episodio' : 'episodios'}
          </h2>
          <span className="h-px flex-1 bg-border" />
        </div>
        <SortToggle current={sortOrder} />
      </div>

      {/* Weekly curated picks */}
      {sorted.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {sorted.map((item) => (
            <WeeklyDiscoverCard key={item.slug} item={item} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-sm text-muted">
          Aún no hay episodios publicados. ¡Vuelve pronto!
        </p>
      )}
    </div>
  );
}
