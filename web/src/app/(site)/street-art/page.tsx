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
    title: "Street Art Gallery",
    description: locale === "en" ? "Street art drops and photo sets." : "Nuevos drops de arte urbano y sets de fotos.",
    canonicalPath: "/street-art",
    locale,
  });
}

export default async function StreetArtListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = await getRequestLocale();
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = await getPagedItems(
    "street-art",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
    locale,
  );
  const jsonLd = collectionPageJsonLd({
    title: "Street Art Gallery",
    description:
      locale === "en"
        ? "Street art drops and photo sets."
        : "Nuevos drops de arte urbano y sets de fotos.",
    path: "/street-art",
    locale,
  });

  return (
    <div className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title="Street Art Gallery"
        caption={
          locale === "en"
            ? "Street art drops and photo sets (template data)."
            : "Nuevos drops de arte urbano y sets de fotos (datos de plantilla)."
        }
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
