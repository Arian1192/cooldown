import { eq } from "drizzle-orm";

import seedData from "@/data/events-backend.seed.json";
import { eventRequestsTable, eventsTable, getDb, partnersTable } from "@/lib/events/db";
import {
  type EventRecord,
  type EventRequestRecord,
  type EventRequestStatus,
  type EventSourceMetadata,
  type EventStatus,
  type EventType,
  type PartnerRecord,
} from "@/lib/events/types";

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
  source: EventSourceMetadata;
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

// ── Seed ─────────────────────────────────────────────────────────────────────

const SEEDED_KEY = "__COOLDOWN_EVENTS_SEEDED__";

function ensureSeeded(): void {
  const globalWithFlag = globalThis as typeof globalThis & {
    [SEEDED_KEY]?: boolean;
  };

  if (globalWithFlag[SEEDED_KEY]) {
    return;
  }

  const db = getDb();

  const existingPartners = db.select({ id: partnersTable.id }).from(partnersTable).limit(1).all();

  if (existingPartners.length === 0) {
    for (const p of seedData.partners) {
      db.insert(partnersTable)
        .values({
          id: p.id,
          name: p.name,
          slug: p.slug,
          contactEmail: p.contactEmail,
          raProfileUrl: (p as { raProfileUrl?: string }).raProfileUrl ?? null,
          createdAt: p.createdAt,
        })
        .onConflictDoNothing()
        .run();
    }

    for (const r of seedData.eventRequests) {
      const req = r as typeof r & {
        description?: string;
        priceEur?: number;
        ticketUrl?: string;
        sourceRaUrl?: string;
        moderationNotes?: string;
        linkedEventId?: string;
      };
      db.insert(eventRequestsTable)
        .values({
          id: req.id,
          partnerId: req.partnerId,
          partnerName: req.partnerName,
          title: req.title,
          description: req.description ?? null,
          date: req.date,
          city: req.city,
          venue: req.venue,
          genres: JSON.stringify(req.genres),
          lineUp: JSON.stringify(req.lineUp),
          eventType: req.eventType as EventType,
          priceEur: req.priceEur ?? null,
          ticketUrl: req.ticketUrl ?? null,
          sourceRaUrl: req.sourceRaUrl ?? null,
          status: req.status,
          moderationNotes: req.moderationNotes ?? null,
          linkedEventId: req.linkedEventId ?? null,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt,
        })
        .onConflictDoNothing()
        .run();
    }

    for (const e of seedData.events) {
      const ev = e as typeof e & {
        description?: string;
        priceEur?: number;
        ticketUrl?: string;
      };
      db.insert(eventsTable)
        .values({
          id: ev.id,
          title: ev.title,
          description: ev.description ?? null,
          date: ev.date,
          city: ev.city,
          venue: ev.venue,
          organizer: ev.organizer,
          genres: JSON.stringify(ev.genres),
          lineUp: JSON.stringify(ev.lineUp),
          eventType: ev.eventType as EventType,
          priceEur: ev.priceEur ?? null,
          ticketUrl: ev.ticketUrl ?? null,
          origin: ev.origin,
          status: ev.status,
          source: JSON.stringify(ev.source),
          createdAt: ev.createdAt,
          updatedAt: ev.updatedAt,
        })
        .onConflictDoNothing()
        .run();
    }
  }

  globalWithFlag[SEEDED_KEY] = true;
}

// ── Row mappers ───────────────────────────────────────────────────────────────

type PartnerRow = typeof partnersTable.$inferSelect;
type EventRow = typeof eventsTable.$inferSelect;
type EventRequestRow = typeof eventRequestsTable.$inferSelect;

function rowToPartner(row: PartnerRow): PartnerRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contactEmail: row.contactEmail,
    raProfileUrl: row.raProfileUrl ?? undefined,
    createdAt: row.createdAt,
  };
}

function rowToEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    date: row.date,
    city: row.city,
    venue: row.venue,
    organizer: row.organizer,
    genres: JSON.parse(row.genres) as string[],
    lineUp: JSON.parse(row.lineUp) as string[],
    eventType: row.eventType as EventType,
    priceEur: row.priceEur ?? undefined,
    ticketUrl: row.ticketUrl ?? undefined,
    origin: row.origin as EventRecord["origin"],
    status: row.status as EventStatus,
    source: JSON.parse(row.source) as EventSourceMetadata,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function rowToEventRequest(row: EventRequestRow): EventRequestRecord {
  return {
    id: row.id,
    partnerId: row.partnerId,
    partnerName: row.partnerName,
    title: row.title,
    description: row.description ?? undefined,
    date: row.date,
    city: row.city,
    venue: row.venue,
    genres: JSON.parse(row.genres) as string[],
    lineUp: JSON.parse(row.lineUp) as string[],
    eventType: row.eventType as EventType,
    priceEur: row.priceEur ?? undefined,
    ticketUrl: row.ticketUrl ?? undefined,
    sourceRaUrl: row.sourceRaUrl ?? undefined,
    status: row.status as EventRequestStatus,
    moderationNotes: row.moderationNotes ?? undefined,
    linkedEventId: row.linkedEventId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function listPartners(): PartnerRecord[] {
  ensureSeeded();
  const rows = getDb().select().from(partnersTable).all();
  return rows.map(rowToPartner);
}

export function ensurePartner(input: {
  partnerId?: string;
  partnerName: string;
  contactEmail: string;
}): PartnerRecord {
  ensureSeeded();
  const db = getDb();

  if (input.partnerId) {
    const found = db
      .select()
      .from(partnersTable)
      .where(eq(partnersTable.id, input.partnerId))
      .get();

    if (found) {
      return rowToPartner(found);
    }
  }

  const slug = input.partnerName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existingBySlug = db
    .select()
    .from(partnersTable)
    .where(eq(partnersTable.slug, slug))
    .get();

  if (existingBySlug) {
    return rowToPartner(existingBySlug);
  }

  const created: PartnerRecord = {
    id: input.partnerId ?? newId("partner"),
    name: input.partnerName,
    slug,
    contactEmail: input.contactEmail,
    createdAt: nowIso(),
  };

  db.insert(partnersTable)
    .values({
      id: created.id,
      name: created.name,
      slug: created.slug,
      contactEmail: created.contactEmail,
      raProfileUrl: null,
      createdAt: created.createdAt,
    })
    .run();

  return created;
}

export function createEventRequest(input: RequestInput): EventRequestRecord {
  ensureSeeded();
  const now = nowIso();
  const record: EventRequestRecord = {
    id: newId("req"),
    status: "pending_review",
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  getDb()
    .insert(eventRequestsTable)
    .values({
      id: record.id,
      partnerId: record.partnerId,
      partnerName: record.partnerName,
      title: record.title,
      description: record.description ?? null,
      date: record.date,
      city: record.city,
      venue: record.venue,
      genres: JSON.stringify(record.genres),
      lineUp: JSON.stringify(record.lineUp),
      eventType: record.eventType,
      priceEur: record.priceEur ?? null,
      ticketUrl: record.ticketUrl ?? null,
      sourceRaUrl: record.sourceRaUrl ?? null,
      status: record.status,
      moderationNotes: null,
      linkedEventId: null,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
    .run();

  return record;
}

export function listEventRequests(status?: EventRequestStatus): EventRequestRecord[] {
  ensureSeeded();
  const db = getDb();
  const rows = status
    ? db.select().from(eventRequestsTable).where(eq(eventRequestsTable.status, status)).all()
    : db.select().from(eventRequestsTable).all();
  return rows.map(rowToEventRequest);
}

export function findEventRequestById(requestId: string): EventRequestRecord | undefined {
  ensureSeeded();
  const row = getDb()
    .select()
    .from(eventRequestsTable)
    .where(eq(eventRequestsTable.id, requestId))
    .get();
  return row ? rowToEventRequest(row) : undefined;
}

export function updateEventRequest(
  requestId: string,
  update: Partial<EventRequestRecord>,
): EventRequestRecord | undefined {
  ensureSeeded();
  const db = getDb();
  const existing = db
    .select()
    .from(eventRequestsTable)
    .where(eq(eventRequestsTable.id, requestId))
    .get();

  if (!existing) {
    return undefined;
  }

  const now = nowIso();
  const patch: Partial<typeof eventRequestsTable.$inferInsert> = {
    updatedAt: now,
  };

  if (update.status !== undefined) patch.status = update.status;
  if (update.moderationNotes !== undefined) patch.moderationNotes = update.moderationNotes;
  if (update.linkedEventId !== undefined) patch.linkedEventId = update.linkedEventId;
  if (update.title !== undefined) patch.title = update.title;
  if (update.description !== undefined) patch.description = update.description;
  if (update.date !== undefined) patch.date = update.date;
  if (update.city !== undefined) patch.city = update.city;
  if (update.venue !== undefined) patch.venue = update.venue;
  if (update.genres !== undefined) patch.genres = JSON.stringify(update.genres);
  if (update.lineUp !== undefined) patch.lineUp = JSON.stringify(update.lineUp);
  if (update.eventType !== undefined) patch.eventType = update.eventType;
  if (update.priceEur !== undefined) patch.priceEur = update.priceEur;
  if (update.ticketUrl !== undefined) patch.ticketUrl = update.ticketUrl;
  if (update.sourceRaUrl !== undefined) patch.sourceRaUrl = update.sourceRaUrl;

  db.update(eventRequestsTable)
    .set(patch)
    .where(eq(eventRequestsTable.id, requestId))
    .run();

  const updated = db
    .select()
    .from(eventRequestsTable)
    .where(eq(eventRequestsTable.id, requestId))
    .get();

  return updated ? rowToEventRequest(updated) : undefined;
}

export function createEvent(input: EventInput): EventRecord {
  ensureSeeded();
  const now = nowIso();
  const record: EventRecord = {
    id: newId("evt"),
    createdAt: now,
    updatedAt: now,
    ...input,
  };

  getDb()
    .insert(eventsTable)
    .values({
      id: record.id,
      title: record.title,
      description: record.description ?? null,
      date: record.date,
      city: record.city,
      venue: record.venue,
      organizer: record.organizer,
      genres: JSON.stringify(record.genres),
      lineUp: JSON.stringify(record.lineUp),
      eventType: record.eventType,
      priceEur: record.priceEur ?? null,
      ticketUrl: record.ticketUrl ?? null,
      origin: record.origin,
      status: record.status,
      source: JSON.stringify(record.source),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })
    .run();

  return record;
}

export function listEvents(filters?: {
  organizer?: string;
  dateFrom?: string;
  dateTo?: string;
  genre?: string;
  origin?: EventRecord["origin"];
  status?: EventStatus;
}): EventRecord[] {
  ensureSeeded();
  const rows = getDb().select().from(eventsTable).all();
  const events = rows.map(rowToEvent);

  return events.filter((event) => {
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
  ensureSeeded();
  const normalized = sourceExternalId.trim().toLowerCase();
  const rows = getDb().select().from(eventsTable).all();
  return rows
    .map(rowToEvent)
    .find((event) => event.source.sourceExternalId?.trim().toLowerCase() === normalized);
}
