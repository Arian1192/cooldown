import { cache } from 'react';

import versionedData from '@/data/content.v1.json';

export type ContentType = 'discover' | 'street-art' | 'interviews' | 'reviews';

export type CitySlug = 'barcelona' | 'madrid';

export type SetMoment = 'warm-up' | 'peak-time' | 'closing' | 'after-hours';

export type ContentItem = {
  type: ContentType;
  city: CitySlug;
  tags: string[];
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  coverImageSrc: string;
  coverImageAlt: string;
  episode?: number;
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
  setMoment?: SetMoment;
  embedUrl?: string;
};

type ContentStore = {
  source: 'versioned-json' | 'remote-json' | 'strapi' | 'seed-fallback';
  itemsByType: Record<ContentType, ContentItem[]>;
};

type ContentRepository = {
  name: ContentStore['source'];
  load(): Promise<ContentStore>;
};

const CONTENT_TYPES: ContentType[] = [
  'discover',
  'street-art',
  'interviews',
  'reviews',
];

const CITY_SEQ: CitySlug[] = ['barcelona', 'madrid'];

const TAGS_BY_TYPE: Record<ContentType, string[]> = {
  discover: ['weekly', 'playlist', 'underground', 'electronic'],
  'street-art': ['mural', 'graffiti', 'gallery', 'photo'],
  interviews: ['artist', 'promoter', 'crew', 'scene'],
  reviews: ['album', 'ep', 'live', 'label'],
};

function groupByType(items: ContentItem[]): Record<ContentType, ContentItem[]> {
  const grouped: Record<ContentType, ContentItem[]> = {
    discover: [],
    'street-art': [],
    interviews: [],
    reviews: [],
  };

  for (const item of items) {
    grouped[item.type].push(item);
  }

  for (const type of CONTENT_TYPES) {
    grouped[type].sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  return grouped;
}

function normalizeItem(input: Partial<ContentItem>): ContentItem | null {
  if (!input.type || !CONTENT_TYPES.includes(input.type)) return null;
  if (!input.slug || !input.title || !input.excerpt || !input.date) return null;
  if (!input.city || (input.city !== 'barcelona' && input.city !== 'madrid')) {
    return null;
  }

  return {
    type: input.type,
    city: input.city,
    tags: Array.isArray(input.tags) ? input.tags : [],
    slug: input.slug,
    title: input.title,
    excerpt: input.excerpt,
    date: input.date,
    coverImageSrc: input.coverImageSrc ?? '/placeholders/urban-cover.svg',
    coverImageAlt: input.coverImageAlt ?? input.title,
    episode: input.episode,
    trackArtist: input.trackArtist,
    trackLabel: input.trackLabel,
    trackReleaseDate: input.trackReleaseDate,
    bpm: input.bpm,
    musicalKey: input.musicalKey,
    rating: input.rating,
    verdict: input.verdict,
    technicalBite: input.technicalBite,
    moodScenario: input.moodScenario,
    energyLevel: input.energyLevel,
    setMoment: input.setMoment,
    embedUrl: input.embedUrl,
  };
}

function parseItems(rows: unknown): ContentItem[] {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => normalizeItem((row ?? {}) as Partial<ContentItem>))
    .filter((item): item is ContentItem => item != null);
}

function getVersionedItems() {
  return parseItems(versionedData.items);
}

const versionedJsonRepository: ContentRepository = {
  name: 'versioned-json',
  async load() {
    const items = getVersionedItems();
    return {
      source: this.name,
      itemsByType: groupByType(items),
    };
  },
};

const remoteJsonRepository: ContentRepository = {
  name: 'remote-json',
  async load() {
    const url = process.env.CONTENT_JSON_URL;
    if (!url) {
      throw new Error('CONTENT_JSON_URL is required for remote-json source');
    }

    const response = await fetch(url, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Remote JSON request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as { items?: unknown };
    const items = parseItems(payload.items);

    return {
      source: this.name,
      itemsByType: groupByType(items),
    };
  },
};

const strapiRepository: ContentRepository = {
  name: 'strapi',
  async load() {
    const strapiUrl = (
      process.env.STRAPI_URL ?? 'https://cms-cooldown-roan.ariancoro.com'
    ).replace(/\/$/, '');

    const response = await fetch(`${strapiUrl}/api/weekly-discover-feed`, {
      next: { revalidate: 30 },
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(
        `Strapi weekly-discover-feed failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as { data?: unknown };
    const weeklyDiscoverItems = parseItems(payload.data).map((item) => ({
      ...item,
      type: 'discover' as const,
    }));
    const versionedItems = getVersionedItems().filter(
      (item) => item.type !== 'discover' || item.episode == null,
    );
    const mergedItems = [...weeklyDiscoverItems, ...versionedItems];

    return {
      source: this.name,
      itemsByType: groupByType(mergedItems),
    };
  },
};

const seed = (type: ContentType, count: number, startAt = 1): ContentItem[] =>
  Array.from({ length: count }).map((_, i) => {
    const n = startAt + i;
    const city = CITY_SEQ[i % CITY_SEQ.length];
    const tags = TAGS_BY_TYPE[type];

    return {
      type,
      city,
      tags: [tags[i % tags.length]!, tags[(i + 1) % tags.length]!],
      slug: `${type}-${n}`,
      title: `${labelForType(type)} #${n} (${city})`,
      excerpt:
        'Template content generated as a development fallback. Replace with CMS-backed data.',
      date: new Date(Date.now() - n * 86400000).toISOString().slice(0, 10),
      coverImageSrc: '/placeholders/urban-cover.svg',
      coverImageAlt: `${labelForType(type)} cover`,
    };
  });

function buildSeedFallbackStore(): ContentStore {
  return {
    source: 'seed-fallback',
    itemsByType: {
      discover: seed('discover', 12),
      'street-art': seed('street-art', 12),
      interviews: seed('interviews', 12),
      reviews: seed('reviews', 12),
    },
  };
}

function isSeedFallbackEnabled() {
  const explicit = process.env.CONTENT_ENABLE_SEED_FALLBACK;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

function selectedRepository(): ContentRepository {
  const source = process.env.CONTENT_SOURCE ?? 'strapi';

  switch (source) {
    case 'strapi':
      return strapiRepository;
    case 'remote-json':
      return remoteJsonRepository;
    case 'versioned-json':
    default:
      return versionedJsonRepository;
  }
}

const loadStore = cache(async (): Promise<ContentStore> => {
  const repo = selectedRepository();

  try {
    const store = await repo.load();
    const hasData = CONTENT_TYPES.some((type) => store.itemsByType[type].length > 0);
    if (hasData) {
      return store;
    }

    throw new Error('Selected repository returned no content items');
  } catch {
    if (isSeedFallbackEnabled()) {
      return buildSeedFallbackStore();
    }

    return {
      source: 'versioned-json',
      itemsByType: {
        discover: [],
        'street-art': [],
        interviews: [],
        reviews: [],
      },
    };
  }
});

export async function getContentSourceMeta() {
  const store = await loadStore();
  return { source: store.source };
}

export function labelForType(type: ContentType) {
  switch (type) {
    case 'discover':
      return 'Weekly Discover';
    case 'street-art':
      return 'Street Art Gallery';
    case 'interviews':
      return 'Artist Interview';
    case 'reviews':
      return 'Album Review';
  }
}

export function labelForCity(city: CitySlug) {
  switch (city) {
    case 'barcelona':
      return 'Barcelona';
    case 'madrid':
      return 'Madrid';
  }
}

export async function getItem(type: ContentType, slug: string) {
  const store = await loadStore();
  return store.itemsByType[type].find((x) => x.slug === slug) ?? null;
}

export async function getPagedItems(
  type: ContentType,
  page: number,
  pageSize: number,
) {
  const store = await loadStore();
  const items = store.itemsByType[type];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: safePage, pageCount };
}

export async function getDiscoverArchivePaged(page: number, pageSize: number) {
  const store = await loadStore();
  const items = store.itemsByType.discover.filter((item) => item.episode == null);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: safePage, pageCount };
}

export async function getDiscoverWeeklyNeighbors(slug: string) {
  const store = await loadStore();
  const weeklyItems = store.itemsByType.discover.filter((item) => item.episode != null);
  const index = weeklyItems.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: weeklyItems[index - 1] ?? null,
    next: weeklyItems[index + 1] ?? null,
  };
}

export async function getAllItems(): Promise<ContentItem[]> {
  const store = await loadStore();
  return Object.values(store.itemsByType).flat();
}

export async function searchItems({
  q,
  type,
  city,
}: {
  q?: string;
  type?: ContentType;
  city?: CitySlug;
}) {
  const items = await getAllItems();
  const normalized = (q ?? '').trim().toLowerCase();

  return items.filter((item) => {
    if (type && item.type !== type) return false;
    if (city && item.city !== city) return false;

    if (!normalized) return true;

    const haystack = [item.title, item.excerpt, item.city, item.tags.join(' ')]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
