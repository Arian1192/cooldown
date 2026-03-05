import type { Metadata } from 'next';

import { ContentList } from '@/components/ContentList';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { WeeklyDiscoverCard } from '@/components/WeeklyDiscoverCard';
import { getPagedItems } from '@/lib/content';
import { basicOg } from '@/lib/seo';

export const metadata: Metadata = basicOg({
  title: 'Weekly Discover',
  description: 'Una joya de la música electrónica, cada semana.',
  canonicalPath: '/discover',
});

export default async function DiscoverListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page ?? '1');

  const {
    items,
    page: safePage,
    pageCount,
  } = getPagedItems('discover', Number.isFinite(pageNum) ? pageNum : 1, 10);

  // Split into weekly picks (have episode) and regular items
  const weeklyItems = items.filter((i) => i.episode != null);
  const regularItems = items.filter((i) => i.episode == null);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Weekly Discover"
        caption="Una joya de la música electrónica — Techno, House, Deep House — cada semana."
      />

      {/* Weekly curated picks */}
      {weeklyItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              Picks curados
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {weeklyItems.map((item) => (
              <WeeklyDiscoverCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Regular discover items */}
      {regularItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-muted">
              Archivo
            </h2>
            <span className="h-px flex-1 bg-border" />
          </div>
          <ContentList items={regularItems} />
        </section>
      )}

      <Pagination basePath="/discover" page={safePage} pageCount={pageCount} />
    </div>
  );
}
