import type { ContentItem } from "@/lib/content";
import { labelForCity, labelForType } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { env } from "@/env";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

export function articleJsonLd(item: ContentItem, locale: Locale = DEFAULT_LOCALE) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.excerpt,
    datePublished: item.date,
    dateModified: item.date,
    articleSection: labelForType(item.type, locale),
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

export function cityEventJsonLd(
  city: "barcelona" | "madrid",
  locale: Locale = DEFAULT_LOCALE,
) {
  // This is a minimal placeholder Event schema to establish the pattern.
  // When real events are modeled, replace with actual startDate/location/performer.
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name:
      locale === "en"
        ? `${env.NEXT_PUBLIC_SITE_NAME} - ${labelForCity(city)} events`
        : `${env.NEXT_PUBLIC_SITE_NAME} - eventos en ${labelForCity(city)}`,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: labelForCity(city),
    },
    url: siteUrl(`/city/${city}`),
    description:
      locale === "en"
        ? `City landing page for ${labelForCity(city)}.`
        : `Pagina de ciudad para ${labelForCity(city)}.`,
  };
}

export function collectionPageJsonLd({
  title,
  description,
  path,
  locale = DEFAULT_LOCALE,
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
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
    inLanguage: locale,
  };
}

export function websiteJsonLd(locale: Locale = DEFAULT_LOCALE) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: env.NEXT_PUBLIC_SITE_NAME,
    url: siteUrl("/"),
    inLanguage: locale,
  };
}
