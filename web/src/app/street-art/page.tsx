import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ContentList } from "@/components/ContentList";
import { getPagedItems } from "@/lib/content";
import { basicOg } from "@/lib/seo";

export const metadata: Metadata = basicOg({
  title: "Street Art Gallery",
  description: "Street art drops and photo sets.",
  canonicalPath: "/street-art",
});

export default async function StreetArtListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = getPagedItems(
    "street-art",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Street Art Gallery"
        caption="Street art drops and photo sets (template data)."
      />
      <ContentList items={items} />
      <Pagination
        basePath="/street-art"
        page={safePage}
        pageCount={pageCount}
      />
    </div>
  );
}
