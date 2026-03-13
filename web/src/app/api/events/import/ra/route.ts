import { NextResponse } from "next/server";

import {
  measureRaAutofillCoverage,
  parseResidentAdvisorEvent,
  toDraftRaEvent,
} from "@/lib/events/ra";
import { createEvent, findEventBySourceExternalId } from "@/lib/events/store";
import { parseRaImportPayload } from "@/lib/events/validators";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = parseRaImportPayload(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.errors,
      },
      { status: 400 },
    );
  }

  const raEvent = await parseResidentAdvisorEvent(parsed.data);

  if (!raEvent) {
    return NextResponse.json(
      {
        error: "Invalid Resident Advisor URL",
      },
      { status: 400 },
    );
  }

  const existing = findEventBySourceExternalId(raEvent.sourceExternalId);

  if (existing) {
    return NextResponse.json({
      message: "Event already imported",
      deduplicated: true,
      data: existing,
    });
  }

  const created = createEvent(toDraftRaEvent(raEvent));
  const coverage = measureRaAutofillCoverage(raEvent);

  return NextResponse.json(
    {
      message: "Resident Advisor event imported as draft",
      deduplicated: false,
      data: created,
      mappingCoverage: coverage,
    },
    { status: 201 },
  );
}
