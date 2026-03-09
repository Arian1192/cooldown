// Lightweight env access helpers.
// - `NEXT_PUBLIC_*` variables are safe to read on the client.
// - Non-prefixed vars should be treated as server-only.

export const env = {
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Music + Urban',

  // Analytics (public)
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,

  // Server-only. Used for canonical URLs, sitemap, RSS.
  // On Vercel, `VERCEL_URL` is automatically available (hostname without protocol).
  SITE_URL:
    process.env.SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'),

  // Server-only CMS endpoint
  STRAPI_URL:
    process.env.STRAPI_URL ?? 'https://cms-cooldown-roan.ariancoro.com',

  // Server-only content source selector (`versioned-json` | `remote-json` | `strapi`)
  CONTENT_SOURCE: process.env.CONTENT_SOURCE ?? 'strapi',
  CONTENT_JSON_URL: process.env.CONTENT_JSON_URL,
  CONTENT_ENABLE_SEED_FALLBACK: process.env.CONTENT_ENABLE_SEED_FALLBACK,
};
