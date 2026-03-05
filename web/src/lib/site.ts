import { env } from "@/env";

export function siteUrl(pathname: string = "/") {
  const base = env.SITE_URL.replace(/\/$/, "");
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}
