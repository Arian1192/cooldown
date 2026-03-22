import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const stateKey = "__COOLDOWN_EVENTS_BACKEND_STATE__";
const originalCwd = process.cwd();

describe("events store persistence", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "cooldown-events-store-"));
    process.chdir(tempDir);
    delete (globalThis as typeof globalThis & { [stateKey]?: unknown })[stateKey];
    vi.resetModules();
  });

  afterEach(() => {
    process.chdir(originalCwd);
    delete (globalThis as typeof globalThis & { [stateKey]?: unknown })[stateKey];
    vi.resetModules();
    if (tempDir) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test("persists mutations to disk", async () => {
    const store = await import("@/lib/events/store");

    store.createEventRequest({
      partnerId: "partner_test",
      partnerName: "Test Partner",
      title: "Persistent Request",
      description: "persist me",
      date: "2026-04-02T22:00:00.000Z",
      city: "Barcelona",
      venue: "Test Venue",
      genres: ["Techno"],
      lineUp: ["Test Artist"],
      eventType: "club_night",
    });

    const persistedPath = join(tempDir, ".data", "events-backend.state.json");
    expect(existsSync(persistedPath)).toBe(true);

    const persisted = JSON.parse(readFileSync(persistedPath, "utf8")) as {
      eventRequests: Array<{ title: string }>;
    };

    expect(
      persisted.eventRequests.some((request) => request.title === "Persistent Request"),
    ).toBe(true);
  });

  test("rehydrates persisted state after module reset", async () => {
    const firstLoad = await import("@/lib/events/store");

    const created = firstLoad.createEventRequest({
      partnerId: "partner_test",
      partnerName: "Reload Partner",
      title: "Reloaded Request",
      description: "survives reload",
      date: "2026-04-03T22:00:00.000Z",
      city: "Madrid",
      venue: "Reload Venue",
      genres: ["House"],
      lineUp: ["Reload Artist"],
      eventType: "club_night",
    });

    delete (globalThis as typeof globalThis & { [stateKey]?: unknown })[stateKey];
    vi.resetModules();

    const secondLoad = await import("@/lib/events/store");
    const found = secondLoad.findEventRequestById(created.id);

    expect(found?.title).toBe("Reloaded Request");
  });
});
