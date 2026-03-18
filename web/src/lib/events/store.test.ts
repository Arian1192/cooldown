import path from "node:path";
import os from "node:os";
import fs from "node:fs";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

const SEEDED_KEY = "__COOLDOWN_EVENTS_SEEDED__";
const DB_KEY = "__COOLDOWN_EVENTS_DB__";

function resetGlobals() {
  const g = globalThis as Record<string, unknown>;
  delete g[SEEDED_KEY];
  delete g[DB_KEY];
}

describe("events store (SQLite)", () => {
  let tmpDb: string;

  beforeEach(() => {
    tmpDb = path.join(os.tmpdir(), `events-test-${Math.random().toString(36).slice(2)}.db`);
    process.env.EVENTS_DB_PATH = tmpDb;
    resetGlobals();
  });

  afterEach(() => {
    resetGlobals();
    delete process.env.EVENTS_DB_PATH;
    try { fs.unlinkSync(tmpDb); } catch { /* ignore */ }
    try { fs.unlinkSync(`${tmpDb}-shm`); } catch { /* ignore */ }
    try { fs.unlinkSync(`${tmpDb}-wal`); } catch { /* ignore */ }
  });

  it("seeds partners on first call", async () => {
    const { listPartners } = await import("@/lib/events/store");
    const partners = listPartners();
    expect(partners.length).toBeGreaterThan(0);
    expect(partners[0].id).toBe("partner_nitsa");
  });

  it("seeds event requests on first call", async () => {
    const { listEventRequests } = await import("@/lib/events/store");
    const requests = listEventRequests();
    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0].id).toBe("req_01");
  });

  it("seeds events on first call", async () => {
    const { listEvents } = await import("@/lib/events/store");
    const events = listEvents();
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].id).toBe("evt_native_01");
  });

  it("creates and retrieves a partner via ensurePartner", async () => {
    const { ensurePartner, listPartners } = await import("@/lib/events/store");
    const partner = ensurePartner({ partnerName: "Test Club", contactEmail: "test@club.com" });
    expect(partner.slug).toBe("test-club");
    expect(partner.contactEmail).toBe("test@club.com");

    const all = listPartners();
    expect(all.some((p) => p.id === partner.id)).toBe(true);
  });

  it("ensurePartner is idempotent by slug", async () => {
    const { ensurePartner, listPartners } = await import("@/lib/events/store");
    const first = ensurePartner({ partnerName: "Idempotent Club", contactEmail: "a@b.com" });
    const second = ensurePartner({ partnerName: "Idempotent Club", contactEmail: "c@d.com" });
    expect(second.id).toBe(first.id);

    const all = listPartners();
    const matches = all.filter((p) => p.slug === "idempotent-club");
    expect(matches.length).toBe(1);
  });

  it("creates an event request and retrieves it by id", async () => {
    const { createEventRequest, findEventRequestById } = await import("@/lib/events/store");
    const req = createEventRequest({
      partnerId: "partner_nitsa",
      partnerName: "Nitsa Club",
      title: "Test Night",
      date: "2026-04-01T22:00:00.000Z",
      city: "Barcelona",
      venue: "Nitsa",
      genres: ["techno"],
      lineUp: ["DJ X"],
      eventType: "club_night",
    });

    expect(req.status).toBe("pending_review");
    const found = findEventRequestById(req.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe("Test Night");
    expect(found?.genres).toEqual(["techno"]);
  });

  it("filters event requests by status", async () => {
    const { createEventRequest, listEventRequests, updateEventRequest } = await import(
      "@/lib/events/store"
    );
    const req = createEventRequest({
      partnerId: "partner_nitsa",
      partnerName: "Nitsa Club",
      title: "Filter Test",
      date: "2026-04-10T22:00:00.000Z",
      city: "Madrid",
      venue: "Venue X",
      genres: ["house"],
      lineUp: ["DJ Y"],
      eventType: "showcase",
    });

    updateEventRequest(req.id, { status: "approved" });

    const pending = listEventRequests("pending_review");
    const approved = listEventRequests("approved");

    expect(pending.some((r) => r.id === req.id)).toBe(false);
    expect(approved.some((r) => r.id === req.id)).toBe(true);
  });

  it("creates an event and filters by status", async () => {
    const { createEvent, listEvents } = await import("@/lib/events/store");
    const evt = createEvent({
      title: "Draft Event",
      date: "2026-05-01T20:00:00.000Z",
      city: "Berlin",
      venue: "Berghain",
      organizer: "Cooldown",
      genres: ["techno"],
      lineUp: ["Artist Z"],
      eventType: "club_night",
      origin: "native",
      status: "draft",
      source: { source: "native" },
    });

    const drafts = listEvents({ status: "draft" });
    const published = listEvents({ status: "published" });

    expect(drafts.some((e) => e.id === evt.id)).toBe(true);
    expect(published.some((e) => e.id === evt.id)).toBe(false);
  });

  it("persists data across multiple getDb() calls (same process)", async () => {
    const { createEvent, listEvents } = await import("@/lib/events/store");
    createEvent({
      title: "Persistence Check",
      date: "2026-06-01T20:00:00.000Z",
      city: "Barcelona",
      venue: "Sidecar",
      organizer: "Cooldown",
      genres: ["house"],
      lineUp: [],
      eventType: "pop_up",
      origin: "native",
      status: "published",
      source: { source: "native" },
    });

    const events = listEvents({ status: "published" });
    expect(events.some((e) => e.title === "Persistence Check")).toBe(true);
  });

  it("findEventBySourceExternalId returns correct record", async () => {
    const { createEvent, findEventBySourceExternalId } = await import("@/lib/events/store");
    createEvent({
      title: "RA Import",
      date: "2026-07-01T22:00:00.000Z",
      city: "Barcelona",
      venue: "Input",
      organizer: "RA",
      genres: ["techno"],
      lineUp: [],
      eventType: "club_night",
      origin: "ra_imported",
      status: "published",
      source: { source: "resident_advisor", sourceExternalId: "RA-12345" },
    });

    const found = findEventBySourceExternalId("ra-12345");
    expect(found).toBeDefined();
    expect(found?.title).toBe("RA Import");
  });
});
