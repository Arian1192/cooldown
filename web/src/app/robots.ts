import type { MetadataRoute } from "next";

import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Disallow internal Next routes and common noise.
      disallow: ["/_next/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
