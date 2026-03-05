import { NextResponse } from "next/server";

import { getAllItems, labelForType } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { env } from "@/env";

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const items = getAllItems()
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 20);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(env.NEXT_PUBLIC_SITE_NAME)}</title>
    <link>${escapeXml(siteUrl("/"))}</link>
    <description>${escapeXml("Latest posts (template RSS).")}</description>
    ${items
      .map((item) => {
        const url = siteUrl(`/${item.type}/${item.slug}`);
        return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${escapeXml(new Date(item.date).toUTCString())}</pubDate>
      <category>${escapeXml(labelForType(item.type))}</category>
      <description>${escapeXml(item.excerpt)}</description>
    </item>`;
      })
      .join("")}
  </channel>
</rss>
`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
