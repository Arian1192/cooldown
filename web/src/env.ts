// Lightweight env access helpers.
// - `NEXT_PUBLIC_*` variables are safe to read on the client.
// - Non-prefixed vars should be treated as server-only.

function normalizeUrl(value: string): string {
  return value.replace(/\/$/, '');
}

function resolveSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();
  if (explicit) {
    return normalizeUrl(explicit);
  }

  if (process.env.NODE_ENV === 'production') {
    const vercelUrl = process.env.VERCEL_URL?.trim();
    if (vercelUrl) {
      return normalizeUrl(`https://${vercelUrl}`);
    }

    throw new Error(
      'Missing required env var SITE_URL in production (or VERCEL_URL on Vercel).',
    );
  }

  return 'http://localhost:3000';
}

function resolveStrapiUrl(): string {
  const explicit = process.env.STRAPI_URL?.trim();
  if (explicit) {
    return normalizeUrl(explicit);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required env var STRAPI_URL in production.');
  }

  return 'http://127.0.0.1:1337';
}

export const env = {
  NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'Music + Urban',

  // Analytics (public)
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,

  // Server-only. Used for canonical URLs, sitemap, RSS.
  SITE_URL: resolveSiteUrl(),

  // Server-only CMS endpoint
  STRAPI_URL: resolveStrapiUrl(),
};
