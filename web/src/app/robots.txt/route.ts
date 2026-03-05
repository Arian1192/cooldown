import { NextResponse } from "next/server";

import { baseUrlFromHeaders } from "@/lib/requestUrl";

export async function GET(request: Request) {
  const baseUrl = baseUrlFromHeaders(new Headers(request.headers));

  const body = `User-Agent: *
Allow: /
Disallow: /_next/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
