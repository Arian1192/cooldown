import type { Metadata } from 'next';

import { ContentDetail } from '@/components/ContentDetail';
import { WeeklyDiscoverDetail } from '@/components/WeeklyDiscoverDetail';
import { env } from '@/env';
import { getItem, labelForCity } from '@/lib/content';
import {
  getWeeklyDiscoverItemBySlug,
  getWeeklyDiscoverNeighbors,
} from '@/lib/weeklyDiscover';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item =
    (await getWeeklyDiscoverItemBySlug(slug)) ?? getItem('discover', slug);
  if (!item) return {};

  const title =
    item.episode != null
      ? `Weekly Discover #${String(item.episode).padStart(2, '0')} – ${item.title}`
      : item.title;
  const description = item.verdict ?? item.excerpt;
  const canonical = `/discover/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonical,
      siteName: env.NEXT_PUBLIC_SITE_NAME,
    },
    other: {
      'article:section': 'Weekly Discover',
      'article:tag': item.tags.join(','),
      'article:published_time': item.date,
      'music:musician': labelForCity(item.city),
    },
  };
}

export default async function DiscoverDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const weeklyItem = await getWeeklyDiscoverItemBySlug(slug);

  // Weekly curated picks get the full structured template
  if (weeklyItem?.episode != null) {
    const { previous, next } = await getWeeklyDiscoverNeighbors(slug);
    return (
      <WeeklyDiscoverDetail item={weeklyItem} previous={previous} next={next} />
    );
  }

  // Regular discover items fall back to the generic template
  return <ContentDetail type="discover" slug={slug} />;
}
