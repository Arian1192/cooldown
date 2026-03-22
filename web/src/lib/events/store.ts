import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import seedData from "@/data/events-backend.seed.json";
import {
  type EventRecord,
  type EventRequestRecord,
  type EventRequestStatus,
  type EventStatus,
  type EventType,
  type EventsBackendState,
  type PartnerRecord,
} from "@/lib/events/types";

const stateKey = "__COOLDOWN_EVENTS_BACKEND_STATE__";
const persistenceFilePath = join(process.cwd(), ".data", "events-backend.state.json");

interface RequestInput {
  partnerId: string;
  partnerName: string;
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
}

interface EventInput {
  title: string;
  description?: string;
  date: string;
  city: string;
  venue: string;
  organizer: string;
  genres: string[];
  lineUp: string[];
  eventType: EventType;
  priceEur?: number;
  ticketUrl?: string;
  origin: EventRecord["origin"];
  status: EventStatus;
  source: EventRecord["source"];
}

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneSeed(): EventsBackendState {
  return {
    partners: JSON.parse(JSON.stringify(seedData.partners)) as PartnerRecord[],
    eventRequests: JSON.parse(
      JSON.stringify(seedData.eventRequests),
    ) as EventRequestRecord[],
    events: JSON.parse(JSON.stringify(seedData.events)) as EventRecord[],
  };
}

function cloneState(state: EventsBackendState): EventsBackendState {
  return JSON.parse(JSON.stringify(state)) as EventsBackendState;
}

function isStateShape(value: unknown): value is EventsBackendState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<EventsBackendState>;
  return (
    Array.isArray(candidate.partners) &&
    Array.isArray(candidate.eventRequests) &&
    Array.isArray(candidate.events)
  );
}

function readPersistedState(): EventsBackendState | null {
  try {
    const raw = readFileSync(persistenceFilePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isStateShape(parsed)) {
      return null;
    }

    return cloneState(parsed);
  } catch {
    return null;
  }
}

function writePersistedState(state: EventsBackendState): void {
  mkdirSync(dirname(persistenceFilePath), { recursive: true });
  const temporaryPath = `${persistenceFilePath}.tmp`;
  writeFileSync(temporaryPath, JSON.stringify(state, null, 2), "utf8");
  renameSync(temporaryPath, persistenceFilePath);
}

function getState(): EventsBackendState {
  const globalWithState = globalThis as typeof globalThis & {
    [stateKey]?: EventsBackendState;
  };

  if (!globalWithState[stateKey]) {
    globalWithState[stateKey] = readPersistedState() ?? cloneSeed();
  }

  return globalWithState[stateKey] as EventsBackendState;
}

function persistState(state: EventsBackendState): void {
  writePersistedState(state);
}

export function listPartners(): PartnerRecord[] {
  return [...getState().partners];
}

export function ensurePartner(input: {
  partnerId?: string;
  partnerName: string;
  contactEmail: string;
}): PartnerRecord {
  const state = getState();

  if (input.partnerId) {
    const found = state.partners.find((partner) => partner.id === input.partnerId);

    if (found) {
      return found;
    }
  }

  const slug = input.partnerName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingBySlug = state.partners.find((partner) => partner.slug === slug);

  if (existingBySlug) {
    return existingBySlug;
  }

  const created: PartnerRecord = {
    id: input.partnerId ?? id("partner"),
    name: input.partnerName,
    slug,
    contactEmail: input.contactEmail,
    createdAt: nowIso(),
  };

  state.partners.push(created);
  persistState(state);
  return created;
}

export function createEventRequest(input: RequestInput): EventRequestRecord {
  const state = getState();
  const now = nowIso();

  const request: EventRequestRecord = {
    id: id("req"),
    status: "pending_review",
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  state.eventRequests.push(request);
  persistState(state);
  return request;
}

export function listEventRequests(status?: EventRequestStatus): EventRequestRecord[] {
  const requests = getState().eventRequests;

  if (!status) {
    return [...requests];
  }

  return requests.filter((request) => request.status === status);
}

export function findEventRequestById(requestId: string): EventRequestRecord | undefined {
  return getState().eventRequests.find((request) => request.id === requestId);
}

export function updateEventRequest(
  requestId: string,
  update: Partial<EventRequestRecord>,
): EventRequestRecord | undefined {
  const state = getState();
  const index = state.eventRequests.findIndex((request) => request.id === requestId);

  if (index < 0) {
    return undefined;
  }

  const current = state.eventRequests[index];
  const next: EventRequestRecord = {
    ...current,
    ...update,
    updatedAt: nowIso(),
  };

  state.eventRequests[index] = next;
  persistState(state);
  return next;
}

export function createEvent(input: EventInput): EventRecord {
  const state = getState();
  const now = nowIso();

  const event: EventRecord = {
    id: id("evt"),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  state.events.push(event);
  persistState(state);
  return event;
}

export function listEvents(filters?: {
  organizer?: string;
  dateFrom?: string;
  dateTo?: string;
  genre?: string;
  origin?: EventRecord["origin"];
  status?: EventStatus;
}): EventRecord[] {
  const base = getState().events;

  return base.filter((event) => {
    if (filters?.organizer && event.organizer.toLowerCase() !== filters.organizer.toLowerCase()) {
      return false;
    }

    if (filters?.origin && event.origin !== filters.origin) {
      return false;
    }

    if (filters?.status && event.status !== filters.status) {
      return false;
    }

    if (filters?.genre) {
      const targetGenre = filters.genre.toLowerCase();
      const hasGenre = event.genres.some((genre) => genre.toLowerCase() === targetGenre);

      if (!hasGenre) {
        return false;
      }
    }

    if (filters?.dateFrom) {
      const fromMs = Date.parse(filters.dateFrom);
      const eventMs = Date.parse(event.date);

      if (!Number.isNaN(fromMs) && eventMs < fromMs) {
        return false;
      }
    }

    if (filters?.dateTo) {
      const toMs = Date.parse(filters.dateTo);
      const eventMs = Date.parse(event.date);

      if (!Number.isNaN(toMs) && eventMs > toMs) {
        return false;
      }
    }

    return true;
  });
}

export function findEventBySourceExternalId(sourceExternalId: string): EventRecord | undefined {
  const normalized = sourceExternalId.trim().toLowerCase();

  return getState().events.find(
    (event) => event.source.sourceExternalId?.trim().toLowerCase() === normalized,
  );
}
