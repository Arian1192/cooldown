import type { Metadata } from "next";

import { ContentDetail } from "@/components/ContentDetail";
import { getItem } from "@/lib/content";
import { env } from "@/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem("reviews", slug);
  if (!item) return {};

  const title = item.title;
  const description = item.excerpt;
  const canonical = `/reviews/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: env.NEXT_PUBLIC_SITE_NAME,
    },
  };
}

export default async function ReviewDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="reviews" slug={slug} />;
}
