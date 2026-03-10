import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ContentList } from "@/components/ContentList";
import { getPagedItems } from "@/lib/content";
import { basicOg } from "@/lib/seo";
import { collectionPageJsonLd } from "@/lib/structuredData";

export const metadata: Metadata = basicOg({
  title: "Reviews",
  description: "Album reviews.",
  canonicalPath: "/reviews",
});

export default async function ReviewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = await getPagedItems(
    "reviews",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
  );
  const jsonLd = collectionPageJsonLd({
    title: "Reviews",
    description: "Album reviews.",
    path: "/reviews",
  });

  return (
    <div className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader title="Reviews" caption="Album reviews (template data)." />
      <ContentList items={items} />
      <Pagination basePath="/reviews" page={safePage} pageCount={pageCount} />
    </div>
  );
}
