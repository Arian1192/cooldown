import type { Metadata } from "next";

import { ContentDetail } from "@/components/ContentDetail";
import { getItem, labelForCity } from "@/lib/content";
import { env } from "@/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = getItem("discover", slug);
  if (!item) return {};

  const title = item.title;
  const description = item.excerpt;
  const canonical = `/discover/${slug}`;

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
    other: {
      "article:section": "Weekly Discover",
      "article:tag": item.tags.join(","),
      "article:published_time": item.date,
      "music:musician": labelForCity(item.city),
    },
  };
}

export default async function DiscoverDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ContentDetail type="discover" slug={slug} />;
}
