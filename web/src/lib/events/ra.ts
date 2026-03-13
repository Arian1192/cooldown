import type { EventRecord } from "@/lib/events/types";

export interface ResidentAdvisorImportInput {
  url: string;
  organizer?: string;
}

export interface ParsedResidentAdvisorEvent {
  sourceExternalId: string;
  sourceUrl: string;
  title: string;
  description?: string;
  date: string;
  city: string;
  venue: string;
  organizer: string;
  genres: string[];
  lineUp: string[];
  priceEur?: number;
}

const DEFAULT_CITY = "Barcelona";
const DEFAULT_VENUE = "TBA";
const DEFAULT_ORGANIZER = "Resident Advisor Partner";

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function extractRaEventId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("ra.co")) {
      return null;
    }

    const byRegex = parsed.pathname.match(/\/events?\/(\d+)/i);
    if (byRegex?.[1]) {
      return byRegex[1];
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    const eventIndex = segments.findIndex((segment) => segment.toLowerCase() === "events");

    if (eventIndex < 0) {
      return null;
    }

    const candidateSegments = segments.slice(eventIndex + 1);

    const numericSegment = candidateSegments.find((segment) => /^\d+$/.test(segment));
    if (numericSegment) {
      return numericSegment;
    }

    const idSegment = candidateSegments[0];
    return idSegment || null;
  } catch {
    return null;
  }
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === "string" && item.trim().length > 0) {
        return item.trim();
      }
    }
  }

  return null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object") {
        const candidate = firstString((item as Record<string, unknown>).name);
        return candidate ?? "";
      }

      return "";
    })
    .filter((item) => item.length > 0);
}

function parsePrice(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
    const parsed = Number(normalized);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function extractJsonLd(html: string): unknown[] {
  const scripts = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const parsedObjects: unknown[] = [];

  for (const match of scripts) {
    const raw = match[1]?.trim();

    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;

      if (Array.isArray(parsed)) {
        parsedObjects.push(...parsed);
      } else if (parsed && typeof parsed === "object" && "@graph" in parsed) {
        const graph = (parsed as { "@graph"?: unknown })["@graph"];
        if (Array.isArray(graph)) {
          parsedObjects.push(...graph);
        } else {
          parsedObjects.push(parsed);
        }
      } else {
        parsedObjects.push(parsed);
      }
    } catch {
      continue;
    }
  }

  return parsedObjects;
}

function findEventObject(candidates: unknown[]): Record<string, unknown> | null {
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") {
      continue;
    }

    const object = candidate as Record<string, unknown>;
    const type = object["@type"];
    const normalized = Array.isArray(type) ? type.map((item) => String(item)) : [String(type)];

    if (normalized.some((item) => item.toLowerCase() === "event")) {
      return object;
    }
  }

  return null;
}

function splitKeywords(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(/[,/|]/g)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

async function fetchResidentAdvisorMetadata(
  url: string,
): Promise<Partial<ParsedResidentAdvisorEvent>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "CooldownBot/1.0 (+https://cooldown.local)",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return {};
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      return {};
    }

    const html = await response.text();
    const jsonLdEntries = extractJsonLd(html);
    const eventObject = findEventObject(jsonLdEntries);

    if (!eventObject) {
      return {};
    }

    const location = eventObject.location as
      | { name?: unknown; address?: { addressLocality?: unknown } | unknown }
      | undefined;
    const organizer = eventObject.organizer as { name?: unknown } | undefined;
    const offers = eventObject.offers as { price?: unknown } | { price?: unknown }[] | undefined;
    const normalizedOffers = Array.isArray(offers) ? offers[0] : offers;

    const keywordField = firstString(eventObject.keywords);
    const genreField = firstString(eventObject.genre);
    const genres = splitKeywords(keywordField ?? genreField);
    const lineUp = toStringArray(eventObject.performer);

    return {
      title: firstString(eventObject.name) ?? undefined,
      description: firstString(eventObject.description) ?? undefined,
      date: firstString(eventObject.startDate) ?? undefined,
      city: firstString(
        (location?.address as { addressLocality?: unknown } | undefined)?.addressLocality,
      )
        ?? undefined,
      venue: firstString(location?.name) ?? undefined,
      organizer: firstString(organizer?.name) ?? undefined,
      genres,
      lineUp,
      priceEur: parsePrice(normalizedOffers?.price),
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timeout);
  }
}

export async function parseResidentAdvisorEvent(
  input: ResidentAdvisorImportInput,
): Promise<ParsedResidentAdvisorEvent | null> {
  const sourceExternalId = extractRaEventId(input.url);

  if (!sourceExternalId) {
    return null;
  }

  const now = new Date();
  const dayOffset = Math.max(2, sourceExternalId.length % 14);
  const generatedDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const organizer = input.organizer?.trim() || DEFAULT_ORGANIZER;
  const normalizedTitleBase = slugToTitle(sourceExternalId);
  const metadata = await fetchResidentAdvisorMetadata(input.url);

  return {
    sourceExternalId,
    sourceUrl: input.url,
    title: metadata.title ?? `RA Import: ${normalizedTitleBase}`,
    description: metadata.description,
    date: metadata.date ?? generatedDate.toISOString(),
    city: metadata.city ?? DEFAULT_CITY,
    venue: metadata.venue ?? DEFAULT_VENUE,
    organizer: metadata.organizer ?? organizer,
    genres: metadata.genres && metadata.genres.length > 0 ? metadata.genres : ["electronic"],
    lineUp: metadata.lineUp && metadata.lineUp.length > 0 ? metadata.lineUp : ["TBA"],
    priceEur: metadata.priceEur ?? 20,
  };
}

export function toDraftRaEvent(parsed: ParsedResidentAdvisorEvent): Omit<EventRecord, "id" | "createdAt" | "updatedAt"> {
  return {
    title: parsed.title,
    description: parsed.description,
    date: parsed.date,
    city: parsed.city,
    venue: parsed.venue,
    organizer: parsed.organizer,
    genres: parsed.genres,
    lineUp: parsed.lineUp,
    eventType: "club_night",
    priceEur: parsed.priceEur,
    origin: "ra_imported",
    status: "draft",
    source: {
      source: "resident_advisor",
      sourceExternalId: parsed.sourceExternalId,
      sourceUrl: parsed.sourceUrl,
      importedAt: new Date().toISOString(),
    },
  };
}

export function measureRaAutofillCoverage(parsed: ParsedResidentAdvisorEvent): {
  filledFields: number;
  totalFields: number;
  ratio: number;
} {
  const checks = [
    parsed.title.trim().length > 0,
    parsed.date.trim().length > 0,
    parsed.city.trim().length > 0,
    parsed.venue.trim().length > 0,
    parsed.organizer.trim().length > 0,
    parsed.genres.length > 0,
    parsed.lineUp.length > 0,
    parsed.priceEur !== undefined,
  ];
  const filledFields = checks.filter(Boolean).length;
  const totalFields = checks.length;

  return {
    filledFields,
    totalFields,
    ratio: Number((filledFields / totalFields).toFixed(3)),
  };
}
