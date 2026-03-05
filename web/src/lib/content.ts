export type ContentType =
  | "discover"
  | "street-art"
  | "interviews"
  | "reviews";

export type CitySlug = "barcelona" | "madrid";

export type ContentItem = {
  type: ContentType;
  city: CitySlug;
  tags: string[];
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

const CITY_SEQ: CitySlug[] = ["barcelona", "madrid"];

const TAGS_BY_TYPE: Record<ContentType, string[]> = {
  discover: ["weekly", "playlist", "underground", "electronic"],
  "street-art": ["mural", "graffiti", "gallery", "photo"],
  interviews: ["artist", "promoter", "crew", "scene"],
  reviews: ["album", "ep", "live", "label"],
};

const seed = (type: ContentType, count: number): ContentItem[] =>
  Array.from({ length: count }).map((_, i) => {
    const n = i + 1;
    const city = CITY_SEQ[i % CITY_SEQ.length];
    const tags = TAGS_BY_TYPE[type];

    return {
      type,
      city,
      tags: [tags[i % tags.length]!, tags[(i + 1) % tags.length]!],
      slug: `${type}-${n}`,
      title: `${labelForType(type)} #${n} (${city})`,
      excerpt:
        "Template content. This will be replaced by CMS-backed data in a later sprint.",
      date: new Date(Date.now() - n * 86400000).toISOString().slice(0, 10),
    };
  });

export const CONTENT: Record<ContentType, ContentItem[]> = {
  discover: seed("discover", 23),
  "street-art": seed("street-art", 17),
  interviews: seed("interviews", 12),
  reviews: seed("reviews", 31),
};

export function labelForType(type: ContentType) {
  switch (type) {
    case "discover":
      return "Weekly Discover";
    case "street-art":
      return "Street Art Gallery";
    case "interviews":
      return "Artist Interview";
    case "reviews":
      return "Album Review";
  }
}

export function labelForCity(city: CitySlug) {
  switch (city) {
    case "barcelona":
      return "Barcelona";
    case "madrid":
      return "Madrid";
  }
}

export function getItem(type: ContentType, slug: string) {
  return CONTENT[type].find((x) => x.slug === slug) ?? null;
}

export function getPagedItems(type: ContentType, page: number, pageSize: number) {
  const items = CONTENT[type];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: safePage, pageCount };
}

export function getAllItems(): ContentItem[] {
  return Object.values(CONTENT).flat();
}

export function searchItems({
  q,
  type,
  city,
}: {
  q?: string;
  type?: ContentType;
  city?: CitySlug;
}) {
  const normalized = (q ?? "").trim().toLowerCase();

  return getAllItems().filter((item) => {
    if (type && item.type !== type) return false;
    if (city && item.city !== city) return false;

    if (!normalized) return true;

    const haystack = [
      item.title,
      item.excerpt,
      item.city,
      item.tags.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
