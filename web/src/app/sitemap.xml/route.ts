import { NextResponse } from "next/server";

import { getAllItems } from "@/lib/content";
import { baseUrlFromHeaders } from "@/lib/requestUrl";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: Request) {
  const baseUrl = baseUrlFromHeaders(new Headers(request.headers));
  const now = new Date().toISOString();

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

  const dynamicRoutes = getAllItems().map((item) => `/${item.type}/${item.slug}`);

  const urls = [...staticRoutes, ...dynamicRoutes]
    .map((path) => {
      const loc = `${baseUrl}${path}`;
      const priority = path === "/" ? "1" : "0.6";
      return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(now)}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
