import type { Locale } from '@/lib/i18n';

export type EventCity = 'barcelona' | 'madrid';
export type EventCityFilter = EventCity | 'all';

export type RaEvent = {
  id: string;
  title: string;
  venue: string;
  city: EventCity;
  startDateIso: string;
  sourceUrl: string;
  imageUrl?: string;
};

type CityFetchResult = {
  city: EventCity;
  events: RaEvent[];
  error: string | null;
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const CITY_CONFIG: Record<EventCity, { pageUrl: string; areaId: number }> = {
  barcelona: {
    pageUrl: 'https://ra.co/events/es/barcelona',
    areaId: 20,
  },
  madrid: {
    pageUrl: 'https://ra.co/events/es/madrid',
    areaId: 41,
  },
};

const CLOUDLFARE_MARKERS = ['cf-error-details', 'Attention Required! | Cloudflare'];

const GRAPHQL_QUERY = `
query GetUpcomingEvents($areaId: Int!, $fromDate: DateTime!, $pageSize: Int!, $page: Int!) {
  facetedSearch(
    types: [EVENT]
    filters: { areas: { eq: $areaId }, date: { gte: $fromDate } }
    page: $page
    pageSize: $pageSize
    sort: { date: { priority: 1, order: ASCENDING } }
  ) {
    results {
      data {
        __typename
        ... on Event {
          id
          title
          date
          contentUrl
          flyerFront
          images {
            filename
            type
          }
          venue {
            name
          }
          area {
            id
            name
            urlName
          }
        }
      }
    }
  }
}
`;

export async function getResidentAdvisorEvents({
  city = 'all',
  limit = 40,
  fromDate,
  toDate,
}: {
  city?: EventCityFilter;
  limit?: number;
  fromDate?: string;
  toDate?: string;
} = {}): Promise<{
  events: RaEvent[];
  unavailableCities: EventCity[];
  generatedAtIso: string;
}> {
  const cities = city === 'all' ? (['barcelona', 'madrid'] as const) : [city];

  // Avoid flaky network dependency in unit/route smoke tests.
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return {
      events: [],
      unavailableCities: [...cities],
      generatedAtIso: new Date().toISOString(),
    };
  }

  const perCityLimit = Math.max(Math.ceil(Math.max(limit, 1) / cities.length), 10);
  const fetched = await Promise.all(
    cities.map((cityName) =>
      fetchCityEvents(cityName, perCityLimit, {
        fromDate,
        toDate,
      }),
    ),
  );

  const allEvents = fetched
    .flatMap((result) => result.events)
    .sort((a, b) => new Date(a.startDateIso).getTime() - new Date(b.startDateIso).getTime())
    .slice(0, Math.max(limit, 1));

  const unavailableCities = fetched
    .filter((result) => result.error)
    .map((result) => result.city);

  return {
    events: allEvents,
    unavailableCities,
    generatedAtIso: new Date().toISOString(),
  };
}

async function fetchCityEvents(
  city: EventCity,
  pageSize: number,
  dateRange: { fromDate?: string; toDate?: string },
): Promise<CityFetchResult> {
  try {
    const gqlEvents = await fetchCityEventsFromGraphql(city, pageSize, dateRange);

    if (gqlEvents.length > 0) {
      return { city, events: gqlEvents, error: null };
    }

    const htmlEvents = await fetchCityEventsFromHtml(city);
    const rangedFallback = clampEventsByDateRange(
      htmlEvents,
      dateRange.fromDate,
      dateRange.toDate,
    );
    if (rangedFallback.length > 0) {
      return { city, events: rangedFallback, error: null };
    }

    return {
      city,
      events: [],
      error: 'No events returned from GraphQL or HTML fallback',
    };
  } catch (error) {
    return {
      city,
      events: [],
      error: error instanceof Error ? error.message : 'Unknown scraping error',
    };
  }
}

async function fetchCityEventsFromGraphql(
  city: EventCity,
  pageSize: number,
  dateRange: { fromDate?: string; toDate?: string },
): Promise<RaEvent[]> {
  const config = CITY_CONFIG[city];
  const fromDate =
    dateRange.fromDate ??
    new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const toDate = dateRange.toDate;

  const deduped = new Map<string, RaEvent>();
  const maxPages = 8;

  for (let page = 1; page <= maxPages; page += 1) {
    const payload = await fetchGraphqlEventsPage({
      areaId: config.areaId,
      fromDate,
      pageSize,
      page,
    });
    const rawItems = payload.data?.facetedSearch?.results ?? [];

    for (const item of rawItems) {
      const event = item.data;
      if (!event || event.__typename !== 'Event') continue;

      const title = event.title?.trim();
      const date = event.date;
      const url = event.contentUrl;

      if (!title || !date || !url) continue;

      const timestamp = Date.parse(date);
      if (Number.isNaN(timestamp)) continue;

      const sourceUrl = normalizeRaUrl(url);
      if (!sourceUrl) continue;

      const eventId = event.id ? `${city}:${event.id}` : `${city}:${sourceUrl}`;
      const imageUrl = resolveGraphqlImageUrl(event);

      deduped.set(eventId, {
        id: eventId,
        title,
        venue: event.venue?.name?.trim() || 'Venue TBA',
        city,
        startDateIso: new Date(timestamp).toISOString(),
        sourceUrl,
        imageUrl,
      });
    }

    if (rawItems.length < pageSize) {
      break;
    }
  }

  const sorted = [...deduped.values()].sort(
    (a, b) => new Date(a.startDateIso).getTime() - new Date(b.startDateIso).getTime(),
  );
  return clampEventsByDateRange(sorted, fromDate, toDate);
}

async function fetchGraphqlEventsPage({
  areaId,
  fromDate,
  pageSize,
  page,
}: {
  areaId: number;
  fromDate: string;
  pageSize: number;
  page: number;
}): Promise<{
  data?: {
    facetedSearch?: {
      results?: Array<{
        data?: {
          __typename?: string;
          id?: string;
          title?: string;
          date?: string;
          contentUrl?: string;
          flyerFront?: string | null;
          images?: Array<{
            filename?: string | null;
            type?: string | null;
          }> | null;
          venue?: { name?: string | null } | null;
        };
      }>;
    };
  };
}> {
  const response = await fetch('https://ra.co/graphql', {
    method: 'POST',
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: {
        areaId,
        fromDate,
        pageSize,
        page,
      },
    }),
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP ${response.status}`);
  }

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string }>;
    data?: {
      facetedSearch?: {
        results?: Array<{
          data?: {
            __typename?: string;
            id?: string;
            title?: string;
            date?: string;
            contentUrl?: string;
            flyerFront?: string | null;
            images?: Array<{
              filename?: string | null;
              type?: string | null;
            }> | null;
            venue?: { name?: string | null } | null;
          };
        }>;
      };
    };
  };

  if (payload.errors?.length) {
    const message = payload.errors[0]?.message ?? 'Unknown GraphQL error';
    throw new Error(`GraphQL error: ${message}`);
  }

  return {
    data: payload.data,
  };
}

function clampEventsByDateRange(
  events: RaEvent[],
  fromDate?: string,
  toDate?: string,
): RaEvent[] {
  if (!fromDate && !toDate) return events;

  return events.filter((event) => {
    const day = event.startDateIso.slice(0, 10);
    if (fromDate && day < fromDate) return false;
    if (toDate && day > toDate) return false;
    return true;
  });
}

function resolveGraphqlImageUrl(event: {
  flyerFront?: string | null;
  images?: Array<{ filename?: string | null; type?: string | null }> | null;
}): string | undefined {
  const front = normalizeRaUrl(event.flyerFront ?? undefined);
  if (front) return front;

  const frontImage = event.images?.find((image) => image.type === 'FLYERFRONT')?.filename;
  if (frontImage) return normalizeRaUrl(frontImage);

  return normalizeRaUrl(event.images?.[0]?.filename ?? undefined);
}

async function fetchCityEventsFromHtml(city: EventCity): Promise<RaEvent[]> {
  const endpoint = CITY_CONFIG[city].pageUrl;

  const response = await fetch(endpoint, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; CooldownBot/1.0; +https://github.com/Arian1192/Cooldown)',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
    next: { revalidate: 60 * 60 * 6 },
  });

  if (!response.ok) {
    throw new Error(`HTML fallback HTTP ${response.status}`);
  }

  const html = await response.text();

  if (CLOUDLFARE_MARKERS.some((marker) => html.includes(marker))) {
    throw new Error('Cloudflare blocked automated access');
  }

  return parseResidentAdvisorEventsFromHtml(html, city);
}

export function parseResidentAdvisorEventsFromHtml(
  html: string,
  city: EventCity,
): RaEvent[] {
  const blocks = extractJsonLdBlocks(html);
  const events: RaEvent[] = [];

  for (const block of blocks) {
    const parsed = parseJson(block);
    if (!parsed) continue;

    const eventNodes = collectEventNodes(parsed);

    for (const node of eventNodes) {
      const normalized = normalizeEvent(node, city);
      if (!normalized) continue;
      events.push(normalized);
    }
  }

  const dedupedByUrl = new Map<string, RaEvent>();
  for (const item of events) {
    if (!dedupedByUrl.has(item.sourceUrl)) {
      dedupedByUrl.set(item.sourceUrl, item);
    }
  }

  return [...dedupedByUrl.values()].sort((a, b) =>
    new Date(a.startDateIso).getTime() - new Date(b.startDateIso).getTime(),
  );
}

export function formatEventDateLabel(startDateIso: string, locale: Locale): string {
  const formatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatter.format(new Date(startDateIso));
}

function extractJsonLdBlocks(html: string): string[] {
  const matches: string[] = [];
  const pattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  let match: RegExpExecArray | null = pattern.exec(html);
  while (match) {
    if (match[1]) matches.push(match[1].trim());
    match = pattern.exec(html);
  }

  return matches;
}

function parseJson(raw: string): JsonValue | null {
  try {
    return JSON.parse(raw) as JsonValue;
  } catch {
    return null;
  }
}

function collectEventNodes(value: JsonValue): Record<string, JsonValue>[] {
  const results: Record<string, JsonValue>[] = [];

  const visit = (node: JsonValue) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (!node || typeof node !== 'object') return;

    const current = node as Record<string, JsonValue>;

    if (isEventNode(current)) {
      results.push(current);
    }

    for (const child of Object.values(current)) {
      visit(child);
    }
  };

  visit(value);
  return results;
}

function isEventNode(node: Record<string, JsonValue>): boolean {
  const type = node['@type'];

  if (typeof type === 'string') {
    return type.toLowerCase() === 'event';
  }

  if (Array.isArray(type)) {
    return type.some((entry) => typeof entry === 'string' && entry.toLowerCase() === 'event');
  }

  return false;
}

function normalizeEvent(node: Record<string, JsonValue>, city: EventCity): RaEvent | null {
  const title = asString(node.name);
  const startDateRaw = asString(node.startDate);

  if (!title || !startDateRaw) return null;

  const timestamp = Date.parse(startDateRaw);
  if (Number.isNaN(timestamp)) return null;

  const sourceUrlRaw = asString(node.url);
  if (!sourceUrlRaw) return null;

  const sourceUrl = normalizeRaUrl(sourceUrlRaw);
  if (!sourceUrl) return null;

  const location = asObject(node.location);
  const venue = asString(location?.name) ?? 'Venue TBA';

  const imageUrl = extractImageUrl(node.image);

  const eventId = `${city}:${sourceUrl}`;

  return {
    id: eventId,
    title,
    venue,
    city,
    startDateIso: new Date(timestamp).toISOString(),
    sourceUrl,
    imageUrl,
  };
}

function asString(value: JsonValue | undefined): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function asObject(value: JsonValue | undefined): Record<string, JsonValue> | null {
  if (!value || Array.isArray(value) || typeof value !== 'object') return null;
  return value as Record<string, JsonValue>;
}

function extractImageUrl(value: JsonValue | undefined): string | undefined {
  if (typeof value === 'string') {
    return normalizeRaUrl(value);
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = extractImageUrl(item);
      if (normalized) return normalized;
    }
    return undefined;
  }

  const imageObject = asObject(value);
  if (!imageObject) return undefined;

  const fromUrl = asString(imageObject.url);
  if (fromUrl) return normalizeRaUrl(fromUrl);

  const fromContentUrl = asString(imageObject.contentUrl);
  if (fromContentUrl) return normalizeRaUrl(fromContentUrl);

  return undefined;
}

function normalizeRaUrl(rawValue: string | null | undefined): string | undefined {
  if (!rawValue) return undefined;

  const value = rawValue.trim();
  if (!value) return undefined;

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  if (value.startsWith('/')) {
    return `https://ra.co${value}`;
  }

  return `https://ra.co/${value}`;
}
