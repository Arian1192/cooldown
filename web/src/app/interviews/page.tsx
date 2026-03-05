import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ContentList } from "@/components/ContentList";
import { getPagedItems } from "@/lib/content";

export default async function InterviewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = getPagedItems(
    "interviews",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Interviews"
        caption="Artist interviews (template data)."
      />
      <ContentList type="interviews" items={items} />
      <Pagination
        basePath="/interviews"
        page={safePage}
        pageCount={pageCount}
      />
    </div>
  );
}
