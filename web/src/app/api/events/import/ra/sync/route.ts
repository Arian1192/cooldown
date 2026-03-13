import { NextResponse } from "next/server";

import { parseResidentAdvisorEvent, toDraftRaEvent } from "@/lib/events/ra";
import { createEvent, findEventBySourceExternalId } from "@/lib/events/store";
import { parseRaSyncPayload } from "@/lib/events/validators";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = parseRaSyncPayload(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.errors,
      },
      { status: 400 },
    );
  }

  const imported: unknown[] = [];
  const skipped: unknown[] = [];
  const failed: unknown[] = [];

  for (const url of parsed.data.urls) {
    const raEvent = parseResidentAdvisorEvent({
      url,
      organizer: parsed.data.organizer,
    });

    if (!raEvent) {
      failed.push({ url, reason: "invalid_ra_url" });
      continue;
    }

    const existing = findEventBySourceExternalId(raEvent.sourceExternalId);

    if (existing) {
      skipped.push({ url, eventId: existing.id, reason: "duplicate" });
      continue;
    }

    const created = createEvent(toDraftRaEvent(raEvent));
    imported.push({ url, eventId: created.id });
  }

  return NextResponse.json({
    message: "Resident Advisor sync processed",
    totals: {
      imported: imported.length,
      skipped: skipped.length,
      failed: failed.length,
    },
    imported,
    skipped,
    failed,
  });
}
