import type { Metadata } from "next";

import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { ContentList } from "@/components/ContentList";
import { getPagedItems } from "@/lib/content";
import { basicOg } from "@/lib/seo";
import { collectionPageJsonLd } from "@/lib/structuredData";
import { getRequestLocale } from "@/lib/requestLocale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return basicOg({
    title: "Interviews",
    description: locale === "en" ? "Artist interviews." : "Entrevistas con artistas.",
    canonicalPath: "/interviews",
    locale,
  });
}

export default async function InterviewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = await getRequestLocale();
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = await getPagedItems(
    "interviews",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
    locale,
  );
  const jsonLd = collectionPageJsonLd({
    title: "Interviews",
    description: locale === "en" ? "Artist interviews." : "Entrevistas con artistas.",
    path: "/interviews",
    locale,
  });

  return (
    <div className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Interviews"
        caption={
          locale === "en"
            ? "Artist interviews (template data)."
            : "Entrevistas con artistas (datos de plantilla)."
        }
      />
      <ContentList items={items} />
      <Pagination
        basePath="/interviews"
        page={safePage}
        pageCount={pageCount}
      />
    </div>
  );
}
