import type { ContentItem } from "@/lib/content";
import { labelForCity, labelForType } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { env } from "@/env";

export function articleJsonLd(item: ContentItem) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.excerpt,
    datePublished: item.date,
    dateModified: item.date,
    articleSection: labelForType(item.type),
    keywords: item.tags,
    author: {
      "@type": "Organization",
      name: env.NEXT_PUBLIC_SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: env.NEXT_PUBLIC_SITE_NAME,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": siteUrl(`/${item.type}/${item.slug}`),
    },
  };
}

export function cityEventJsonLd(city: "barcelona" | "madrid") {
  // This is a minimal placeholder Event schema to establish the pattern.
  // When real events are modeled, replace with actual startDate/location/performer.
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${env.NEXT_PUBLIC_SITE_NAME} – ${labelForCity(city)} events`,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: labelForCity(city),
    },
    url: siteUrl(`/city/${city}`),
    description: `City landing page for ${labelForCity(city)}.`,
  };
}

export function collectionPageJsonLd({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: siteUrl(path),
    isPartOf: {
      "@type": "WebSite",
      name: env.NEXT_PUBLIC_SITE_NAME,
      url: siteUrl("/"),
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: env.NEXT_PUBLIC_SITE_NAME,
    url: siteUrl("/"),
    inLanguage: "es",
  };
}
