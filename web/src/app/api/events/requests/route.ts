import { NextResponse } from "next/server";

import { createEventRequest, ensurePartner, listEventRequests } from "@/lib/events/store";
import { parseEventRequestPayload, parseRequestStatus } from "@/lib/events/validators";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = parseRequestStatus(url.searchParams);
  const requests = listEventRequests(status);

  return NextResponse.json({
    data: requests,
    status: status ?? "all",
    total: requests.length,
  });
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = parseEventRequestPayload(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.errors,
      },
      { status: 400 },
    );
  }

  const partner = ensurePartner({
    partnerId: parsed.data.partnerId,
    partnerName: parsed.data.partnerName,
    contactEmail: parsed.data.contactEmail,
  });

  const created = createEventRequest({
    partnerId: partner.id,
    partnerName: partner.name,
    title: parsed.data.title,
    description: parsed.data.description,
    date: parsed.data.date,
    city: parsed.data.city,
    venue: parsed.data.venue,
    genres: parsed.data.genres,
    lineUp: parsed.data.lineUp,
    eventType: parsed.data.eventType,
    priceEur: parsed.data.priceEur,
    ticketUrl: parsed.data.ticketUrl,
    sourceRaUrl: parsed.data.sourceRaUrl,
  });

  return NextResponse.json(
    {
      message: "Event request submitted",
      data: created,
    },
    { status: 201 },
  );
}
