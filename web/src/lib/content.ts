export type ContentType =
  | "discover"
  | "street-art"
  | "interviews"
  | "reviews";

export type ContentItem = {
  type: ContentType;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
};

const seed = (type: ContentType, count: number): ContentItem[] =>
  Array.from({ length: count }).map((_, i) => {
    const n = i + 1;
    return {
      type,
      slug: `${type}-${n}`,
      title: `${labelForType(type)} #${n}`,
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

export function getItem(type: ContentType, slug: string) {
  return CONTENT[type].find((x) => x.slug === slug) ?? null;
}

export function getPagedItems(
  type: ContentType,
  page: number,
  pageSize: number,
) {
  const items = CONTENT[type];
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), pageCount);
  const start = (safePage - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { items: slice, page: safePage, pageCount };
}
