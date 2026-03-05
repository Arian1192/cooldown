import type { Headers } from "next/dist/compiled/@edge-runtime/primitives";

/**
 * Best-effort base URL inference for Vercel/production environments.
 * Works for Route Handlers (robots/sitemap/rss) where we have request headers.
 */
export function baseUrlFromHeaders(headers: Headers): string {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "https";

  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}
