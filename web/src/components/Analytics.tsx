import Script from "next/script";

import { env } from "@/env";

/**
 * Analytics injection.
 *
 * Defaults to Umami (requested in board comments). Uses public env vars only.
 * No secrets should ever be committed.
 */
export function Analytics() {
  // Umami
  if (env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
    return (
      <Script
        src={env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
        data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
        strategy="afterInteractive"
      />
    );
  }

  return null;
}
