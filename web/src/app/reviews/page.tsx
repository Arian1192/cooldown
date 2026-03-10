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
    title: locale === "en" ? "Reviews" : "Resenas",
    description: locale === "en" ? "Album reviews." : "Resenas de albumes.",
    canonicalPath: "/reviews",
    locale,
  });
}

export default async function ReviewsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const locale = await getRequestLocale();
  const { page } = await searchParams;
  const pageNum = Number(page ?? "1");

  const { items, page: safePage, pageCount } = await getPagedItems(
    "reviews",
    Number.isFinite(pageNum) ? pageNum : 1,
    10,
    locale,
  );
  const jsonLd = collectionPageJsonLd({
    title: locale === "en" ? "Reviews" : "Resenas",
    description: locale === "en" ? "Album reviews." : "Resenas de albumes.",
    path: "/reviews",
    locale,
  });

  return (
    <div className="space-y-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={locale === "en" ? "Reviews" : "Resenas"}
        caption={
          locale === "en"
            ? "Album reviews (template data)."
            : "Resenas de albumes (datos de plantilla)."
        }
      />
      <ContentList items={items} locale={locale} />
      <Pagination basePath="/reviews" page={safePage} pageCount={pageCount} locale={locale} />
    </div>
  );
}
