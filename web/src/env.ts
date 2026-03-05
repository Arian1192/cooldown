// Lightweight env access helpers.
// - `NEXT_PUBLIC_*` variables are safe to read on the client.
// - Non-prefixed vars should be treated as server-only.

export const env = {
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? "Music + Urban",

  // Server-only. Used for canonical URLs, sitemap, RSS.
  SITE_URL: process.env.SITE_URL ?? "http://localhost:3000",

};
