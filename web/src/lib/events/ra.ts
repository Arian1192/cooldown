import type { EventRecord } from "@/lib/events/types";

export interface ResidentAdvisorImportInput {
  url: string;
  organizer?: string;
}

export interface ParsedResidentAdvisorEvent {
  sourceExternalId: string;
  sourceUrl: string;
  title: string;
  date: string;
  city: string;
  venue: string;
  organizer: string;
  genres: string[];
  lineUp: string[];
  priceEur?: number;
}

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

    const segments = parsed.pathname.split("/").filter(Boolean);
    const eventIndex = segments.findIndex((segment) => segment.toLowerCase() === "events");

    if (eventIndex < 0) {
      return null;
    }

    const idSegment = segments[eventIndex + 1];

    if (!idSegment) {
      return null;
    }

    return idSegment;
  } catch {
    return null;
  }
}

export function parseResidentAdvisorEvent(
  input: ResidentAdvisorImportInput,
): ParsedResidentAdvisorEvent | null {
  const sourceExternalId = extractRaEventId(input.url);

  if (!sourceExternalId) {
    return null;
  }

  const now = new Date();
  const dayOffset = Math.max(2, sourceExternalId.length % 14);
  const generatedDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000);
  const organizer = input.organizer?.trim() || "Resident Advisor Partner";
  const normalizedTitleBase = slugToTitle(sourceExternalId);

  return {
    sourceExternalId,
    sourceUrl: input.url,
    title: `RA Import: ${normalizedTitleBase}`,
    date: generatedDate.toISOString(),
    city: "Barcelona",
    venue: "TBA",
    organizer,
    genres: ["electronic"],
    lineUp: ["TBA"],
    priceEur: 20,
  };
}

export function toDraftRaEvent(parsed: ParsedResidentAdvisorEvent): Omit<EventRecord, "id" | "createdAt" | "updatedAt"> {
  return {
    slug: parsed.title
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    title: parsed.title,
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
