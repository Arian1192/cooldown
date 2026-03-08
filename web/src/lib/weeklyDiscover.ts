import type { ContentItem } from '@/lib/content';

const DEFAULT_STRAPI_URL = 'http://127.0.0.1:1337';
const STRAPI_URL = (process.env.STRAPI_URL ?? DEFAULT_STRAPI_URL).replace(
  /\/$/,
  '',
);

type WeeklyDiscoverApiItem = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  city: 'barcelona' | 'madrid';
  tags: string[];
  coverImageSrc?: string;
  coverImageAlt?: string;
  episode: number;
  trackArtist?: string;
  trackLabel?: string;
  trackReleaseDate?: string;
  bpm?: number;
  musicalKey?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  verdict?: string;
  technicalBite?: string;
  moodScenario?: string;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  setMoment?: 'warm-up' | 'peak-time' | 'closing' | 'after-hours';
  embedUrl?: string;
};

type WeeklyDiscoverApiResponse = {
  data: WeeklyDiscoverApiItem[];
};

type WeeklyDiscoverBySlugApiResponse = {
  data: WeeklyDiscoverApiItem;
};

function toContentItem(row: WeeklyDiscoverApiItem): ContentItem {
  return {
    type: 'discover',
    city: row.city,
    tags: Array.isArray(row.tags) ? row.tags : [],
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: row.date,
    coverImageSrc: row.coverImageSrc ?? '/placeholders/urban-cover.svg',
    coverImageAlt: row.coverImageAlt ?? row.title,
    episode: row.episode,
    trackArtist: row.trackArtist,
    trackLabel: row.trackLabel,
    trackReleaseDate: row.trackReleaseDate,
    bpm: row.bpm,
    musicalKey: row.musicalKey,
    rating: row.rating,
    verdict: row.verdict,
    technicalBite: row.technicalBite,
    moodScenario: row.moodScenario,
    energyLevel: row.energyLevel,
    setMoment: row.setMoment,
    embedUrl: row.embedUrl,
  };
}

export async function getWeeklyDiscoverItems(): Promise<ContentItem[]> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/weekly-discover-feed`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return [];
    }

    const payload = (await res.json()) as WeeklyDiscoverApiResponse;
    return (payload.data ?? []).map(toContentItem);
  } catch {
    return [];
  }
}

export async function getWeeklyDiscoverItemBySlug(
  slug: string,
): Promise<ContentItem | null> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/weekly-discover-feed/${slug}`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return null;
    }

    const payload = (await res.json()) as WeeklyDiscoverBySlugApiResponse;
    return payload.data ? toContentItem(payload.data) : null;
  } catch {
    return null;
  }
}

export async function getWeeklyDiscoverNeighbors(slug: string): Promise<{
  previous: ContentItem | null;
  next: ContentItem | null;
}> {
  const items = await getWeeklyDiscoverItems();
  const index = items.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: items[index - 1] ?? null,
    next: items[index + 1] ?? null,
  };
}
