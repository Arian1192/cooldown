import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ContentList } from "@/components/ContentList";
import { getPagedItems } from "@/lib/content";
import { basicOg } from "@/lib/seo";

export const metadata: Metadata = basicOg({
  title: "Weekly Discover",
  description: "New weekly discover picks.",
  canonicalPath: "/discover",
});

export default async function DiscoverListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = getPagedItems(
    "discover",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Weekly Discover"
        caption="New weekly discover picks (template data)."
      />
      <ContentList items={items} />
      <Pagination basePath="/discover" page={safePage} pageCount={pageCount} />
    </div>
  );
}
