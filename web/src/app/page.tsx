import Link from 'next/link';

import { EditorialList } from '@/components/EditorialList';
import { SortToggle } from '@/components/ui/SortToggle';
import { getWeeklyDiscoverItems } from '@/lib/weeklyDiscover';

export default async function Home({
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

  return (
    <div>
      {/* Hero */}
      <section className="mb-16 border-b border-border pb-16">
        <p className="mb-5 font-display text-[11px] font-bold uppercase tracking-[0.32em] text-accent">
          Music · Urban Art · Club Culture
        </p>

        <h1 className="font-display text-[clamp(5rem,14vw,11rem)] font-black uppercase leading-none tracking-[-0.04em]">
          Cool
          <br />
          <span className="text-accent">Down.</span>
        </h1>

        <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-muted">
          Weekly picks, street art, interviews and club culture from Barcelona
          and Madrid.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/discover"
            className="inline-flex items-center bg-accent px-5 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Explore
          </Link>
          <Link
            href="/street-art"
            className="inline-flex items-center border border-border px-5 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            Street Art
          </Link>
          <Link
            href="/interviews"
            className="inline-flex items-center border border-border px-5 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            Interviews
          </Link>
        </div>
      </section>

      {/* Latest Weekly Discover */}
      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.2rem)] font-black uppercase leading-none tracking-tight">
            Latest
          </h2>
          <div className="flex items-center gap-4">
            <SortToggle current={sortOrder} />
            <Link
              href="/discover"
              className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
            >
              All →
            </Link>
          </div>
        </div>

        {sorted.length > 0 ? (
          <EditorialList items={sorted} />
        ) : (
          <p className="py-12 text-center text-sm text-muted">
            No hay picks todavía. ¡Vuelve pronto!
          </p>
        )}
      </section>
    </div>
  );
}
