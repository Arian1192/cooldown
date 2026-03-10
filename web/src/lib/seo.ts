import type { Metadata } from "next";

import { env } from "@/env";
import { siteUrl } from "@/lib/site";

export function basicOg({
  title,
  description,
  canonicalPath,
  type = "website",
  imagePath = "/placeholders/urban-cover.svg",
  publishedTime,
  tags,
}: {
  title: string;
  description: string;
  canonicalPath: string;
  type?: "website" | "article";
  imagePath?: string;
  publishedTime?: string;
  tags?: string[];
}): Metadata {
  const imageUrl = siteUrl(imagePath);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: env.NEXT_PUBLIC_SITE_NAME,
      type,
      locale: "es_ES",
      images: [
        {
          url: imageUrl,
          alt: title,
        },
      ],
      ...(publishedTime ? { publishedTime } : {}),
      ...(tags && tags.length > 0 ? { tags } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}
