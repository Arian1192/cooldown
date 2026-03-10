import type { Metadata } from "next";

import { ContentDetail } from "@/components/ContentDetail";
import { getItem } from "@/lib/content";
import { basicOg } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getItem("reviews", slug);
  if (!item) return {};

  const title = item.title;
  const description = item.excerpt;
  const canonical = `/reviews/${slug}`;

  return basicOg({
    title,
    description,
    canonicalPath: canonical,
    type: "article",
    imagePath: item.coverImageSrc,
    publishedTime: item.date,
    tags: item.tags,
  });
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="reviews" slug={slug} />;
}
