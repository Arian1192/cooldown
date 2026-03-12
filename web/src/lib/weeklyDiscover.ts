import { getDiscoverWeeklyNeighbors, type ContentItem, searchItems } from '@/lib/content';
import type { Locale } from '@/lib/i18n';

export async function getWeeklyDiscoverItems(
  locale?: Locale,
): Promise<ContentItem[]> {
  const items = await searchItems({ type: 'discover', locale });
  return items.filter((item) => item.episode != null);
}

export async function getWeeklyDiscoverItemBySlug(
  slug: string,
  locale?: Locale,
): Promise<ContentItem | null> {
  const items = await getWeeklyDiscoverItems(locale);
  return items.find((item) => item.slug === slug) ?? null;
}

export async function getWeeklyDiscoverNeighbors(
  slug: string,
  locale?: Locale,
): Promise<{
  previous: ContentItem | null;
  next: ContentItem | null;
}> {
  return getDiscoverWeeklyNeighbors(slug, locale);
}
