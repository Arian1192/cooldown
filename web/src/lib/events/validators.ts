import type { EventOrigin, EventRequestStatus, EventType } from "@/lib/events/types";

const EVENT_TYPES: EventType[] = ["club_night", "showcase", "pop_up", "workshop"];
const EVENT_ORIGINS: EventOrigin[] = ["native", "partner", "ra_imported"];
const REQUEST_STATUSES: EventRequestStatus[] = ["pending_review", "approved", "rejected"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter((item) => item.length > 0);

  return cleaned.length > 0 ? cleaned : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function parseEventRequestPayload(payload: unknown):
  | {
      ok: true;
      data: {
        partnerId?: string;
        partnerName: string;
        contactEmail: string;
        title: string;
        description?: string;
        date: string;
        city: string;
        venue: string;
        genres: string[];
        lineUp: string[];
        eventType: EventType;
        priceEur?: number;
        ticketUrl?: string;
        sourceRaUrl?: string;
        logoAssetUrl?: string;
        artworkAssetUrl?: string;
        rightsConfirmed: boolean;
      };
    }
  | { ok: false; errors: string[] } {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be an object"] };
  }

  const partnerName = asTrimmedString(payload.partnerName);
  const contactEmail = asTrimmedString(payload.contactEmail);
  const title = asTrimmedString(payload.title);
  const date = asTrimmedString(payload.date);
  const city = asTrimmedString(payload.city);
  const venue = asTrimmedString(payload.venue);
  const genres = asStringArray(payload.genres);
  const lineUp = asStringArray(payload.lineUp);
  const eventType = asTrimmedString(payload.eventType);
  const rightsConfirmed = asBoolean(payload.rightsConfirmed);
  const logoAssetUrl = asTrimmedString(payload.logoAssetUrl);
  const artworkAssetUrl = asTrimmedString(payload.artworkAssetUrl);

  const errors: string[] = [];

  if (!partnerName) {
    errors.push("partnerName is required");
  }

  if (!contactEmail || !contactEmail.includes("@")) {
    errors.push("contactEmail is required and must be valid");
  }

  if (!title) {
    errors.push("title is required");
  }

  if (!date || Number.isNaN(Date.parse(date))) {
    errors.push("date must be a valid ISO date string");
  }

  if (!city) {
    errors.push("city is required");
  }

  if (!venue) {
    errors.push("venue is required");
  }

  if (!genres) {
    errors.push("genres must be a non-empty string array");
  }

  if (!lineUp) {
    errors.push("lineUp must be a non-empty string array");
  }

  if (!eventType || !EVENT_TYPES.includes(eventType as EventType)) {
    errors.push(`eventType must be one of: ${EVENT_TYPES.join(", ")}`);
  }

  if (!logoAssetUrl) {
    errors.push("logoAssetUrl is required");
  }

  if (!artworkAssetUrl) {
    errors.push("artworkAssetUrl is required");
  }

  if (!rightsConfirmed) {
    errors.push("rightsConfirmed must be true");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const partnerId = asTrimmedString(payload.partnerId) ?? undefined;
  const description = asTrimmedString(payload.description) ?? undefined;
  const ticketUrl = asTrimmedString(payload.ticketUrl) ?? undefined;
  const sourceRaUrl = asTrimmedString(payload.sourceRaUrl) ?? undefined;
  const rawPrice = payload.priceEur;
  const parsedPrice = typeof rawPrice === "number" ? rawPrice : Number.NaN;
  const priceEur = Number.isFinite(parsedPrice) ? parsedPrice : undefined;

  return {
    ok: true,
    data: {
      partnerId,
      partnerName: partnerName as string,
      contactEmail: contactEmail as string,
      title: title as string,
      description,
      date: date as string,
      city: city as string,
      venue: venue as string,
      genres: genres as string[],
      lineUp: lineUp as string[],
      eventType: eventType as EventType,
      priceEur,
      ticketUrl,
      sourceRaUrl,
      logoAssetUrl: logoAssetUrl ?? undefined,
      artworkAssetUrl: artworkAssetUrl ?? undefined,
      rightsConfirmed: rightsConfirmed as boolean,
    },
  };
}

export function parseModerationPayload(payload: unknown):
  | {
      ok: true;
      data: {
        action: "approve" | "reject" | "edit";
        moderationNotes?: string;
        patch?: Record<string, unknown>;
      };
    }
  | { ok: false; errors: string[] } {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be an object"] };
  }

  const action = asTrimmedString(payload.action);

  if (!action || !["approve", "reject", "edit"].includes(action)) {
    return { ok: false, errors: ["action must be one of: approve, reject, edit"] };
  }

  return {
    ok: true,
    data: {
      action: action as "approve" | "reject" | "edit",
      moderationNotes: asTrimmedString(payload.moderationNotes) ?? undefined,
      patch: isObject(payload.patch) ? payload.patch : undefined,
    },
  };
}

export function parseEventFilters(params: URLSearchParams): {
  organizer?: string;
  dateFrom?: string;
  dateTo?: string;
  genre?: string;
  origin?: EventOrigin;
  status?: "draft" | "published";
} {
  const organizer = asTrimmedString(params.get("organizer"));
  const dateFrom = asTrimmedString(params.get("dateFrom"));
  const dateTo = asTrimmedString(params.get("dateTo"));
  const genre = asTrimmedString(params.get("genre"));
  const originCandidate = asTrimmedString(params.get("origin"));
  const statusCandidate = asTrimmedString(params.get("status"));

  const origin =
    originCandidate && EVENT_ORIGINS.includes(originCandidate as EventOrigin)
      ? (originCandidate as EventOrigin)
      : undefined;

  const status =
    statusCandidate && ["draft", "published"].includes(statusCandidate)
      ? (statusCandidate as "draft" | "published")
      : undefined;

  return {
    organizer: organizer ?? undefined,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    genre: genre ?? undefined,
    origin,
    status,
  };
}

export function parseRequestStatus(params: URLSearchParams): EventRequestStatus | undefined {
  const status = asTrimmedString(params.get("status"));

  if (!status) {
    return undefined;
  }

  return REQUEST_STATUSES.includes(status as EventRequestStatus)
    ? (status as EventRequestStatus)
    : undefined;
}

export function parseRaImportPayload(payload: unknown):
  | { ok: true; data: { url: string; organizer?: string } }
  | { ok: false; errors: string[] } {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be an object"] };
  }

  const url = asTrimmedString(payload.url);

  if (!url) {
    return { ok: false, errors: ["url is required"] };
  }

  return {
    ok: true,
    data: {
      url,
      organizer: asTrimmedString(payload.organizer) ?? undefined,
    },
  };
}

export function parseRaSyncPayload(payload: unknown):
  | { ok: true; data: { urls: string[]; organizer?: string } }
  | { ok: false; errors: string[] } {
  if (!isObject(payload)) {
    return { ok: false, errors: ["Payload must be an object"] };
  }

  const urls = asStringArray(payload.urls);

  if (!urls) {
    return { ok: false, errors: ["urls must be a non-empty array"] };
  }

  return {
    ok: true,
    data: {
      urls,
      organizer: asTrimmedString(payload.organizer) ?? undefined,
    },
  };
}
