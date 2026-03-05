import type { Metadata } from "next";

import { env } from "@/env";

export function basicOg({
  title,
  description,
  canonicalPath,
}: {
  title: string;
  description: string;
  canonicalPath: string;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: env.NEXT_PUBLIC_SITE_NAME,
      type: "article",
    },
  };
}
