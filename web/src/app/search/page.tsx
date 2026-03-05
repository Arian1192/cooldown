import type { Metadata } from "next";
import Link from "next/link";

import type { CitySlug, ContentType } from "@/lib/content";
import { basicOg } from "@/lib/seo";

export const metadata: Metadata = basicOg({
  title: "Search",
  description: "Search posts and filter by type/city.",
  canonicalPath: "/search",
});
import { labelForCity, labelForType, searchItems } from "@/lib/content";
import { ContentList } from "@/components/ContentList";
import { Card, CardCaption, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

const CONTENT_TYPES: ContentType[] = [
  "discover",
  "street-art",
  "interviews",
  "reviews",
];

const CITIES: CitySlug[] = ["barcelona", "madrid"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; city?: string }>;
}) {
  const { q, type, city } = await searchParams;

  const typeFilter = CONTENT_TYPES.includes(type as ContentType)
    ? (type as ContentType)
    : undefined;
  const cityFilter = CITIES.includes(city as CitySlug)
    ? (city as CitySlug)
    : undefined;

  const results = searchItems({ q, type: typeFilter, city: cityFilter });

  const captionParts: string[] = [];
  if (q?.trim()) captionParts.push(`Query: “${q.trim()}”`);
  if (typeFilter) captionParts.push(`Type: ${labelForType(typeFilter)}`);
  if (cityFilter) captionParts.push(`City: ${labelForCity(cityFilter)}`);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Search"
        caption={
          captionParts.length
            ? captionParts.join(" · ")
            : "Search title, excerpt, tags, and city (template search)."
        }
      />

      <Card>
        <CardTitle>Filters</CardTitle>
        <CardCaption>
          This is URL-driven. Use links below to apply filters.
        </CardCaption>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted">Content type</div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                href={{ pathname: "/search", query: { q, city } }}
              >
                All
              </Link>
              {CONTENT_TYPES.map((t) => (
                <Link
                  key={t}
                  className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                  href={{ pathname: "/search", query: { q, type: t, city } }}
                >
                  {labelForType(t)}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-muted">City</div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                href={{ pathname: "/search", query: { q, type } }}
              >
                All
              </Link>
              {CITIES.map((c) => (
                <Link
                  key={c}
                  className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
                  href={{ pathname: "/search", query: { q, type, city: c } }}
                >
                  {labelForCity(c)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {results.length ? (
        <div className="space-y-3">
          <div className="text-xs text-muted">{results.length} results</div>
          <ContentList items={results} />
          <p className="text-xs text-muted">
            Note: This list reuses the card renderer; for mixed content types we
            will likely switch to a dedicated “SearchResultCard” component.
          </p>
        </div>
      ) : (
        <Card>
          <CardTitle>Nothing found</CardTitle>
          <CardCaption>
            Try removing filters or adjusting the query. Examples:
            <span className="ml-2 inline-flex flex-wrap gap-2">
              <Link
                className="underline"
                href={{ pathname: "/search", query: { q: "mural" } }}
              >
                mural
              </Link>
              <Link
                className="underline"
                href={{ pathname: "/search", query: { q: "weekly", city: "madrid" } }}
              >
                weekly + madrid
              </Link>
            </span>
          </CardCaption>
        </Card>
      )}

      <Card>
        <CardTitle>MVP approach</CardTitle>
        <CardCaption>
          For now, search is intended to be CMS-native (server-side query).
          If/when performance or relevance needs grow, we can introduce an index
          (Algolia/Meilisearch/Elastic) behind the same URL contract.
        </CardCaption>
      </Card>
    </div>
  );
}
