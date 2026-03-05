import type { MetadataRoute } from "next";

import { getAllItems } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "/",
    "/discover",
    "/street-art",
    "/interviews",
    "/reviews",
    "/search",
    "/city/barcelona",
    "/city/madrid",
  ];

  const items = getAllItems().map((item) => ({
    url: siteUrl(`/${item.type}/${item.slug}`),
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((path) => ({
      url: siteUrl(path),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.6,
    })),
    ...items,
  ];
}
