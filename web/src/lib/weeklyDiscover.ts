import { getDiscoverWeeklyNeighbors, type ContentItem, searchItems } from '@/lib/content';

export async function getWeeklyDiscoverItems(): Promise<ContentItem[]> {
  const items = await searchItems({ type: 'discover' });
  return items.filter((item) => item.episode != null);
}

export async function getWeeklyDiscoverItemBySlug(
  slug: string,
): Promise<ContentItem | null> {
  const items = await getWeeklyDiscoverItems();
  return items.find((item) => item.slug === slug) ?? null;
}

export async function getWeeklyDiscoverNeighbors(slug: string): Promise<{
  previous: ContentItem | null;
  next: ContentItem | null;
}> {
  return getDiscoverWeeklyNeighbors(slug);
}
