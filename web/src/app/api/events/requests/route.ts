import { NextResponse } from "next/server";

import { createEventRequest, ensurePartner, findPartnerById, listEventRequests } from "@/lib/events/store";
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

  // Check if an existing partner is approved before allowing event requests
  if (parsed.data.partnerId) {
    const existing = findPartnerById(parsed.data.partnerId);
    if (existing && existing.status !== "approved") {
      return NextResponse.json(
        { error: "Partner not approved", details: "Tu cuenta de partner debe estar aprobada antes de enviar solicitudes de eventos." },
        { status: 403 },
      );
    }
  }

  const partner = ensurePartner({
    partnerId: parsed.data.partnerId,
    partnerName: parsed.data.partnerName,
    contactEmail: parsed.data.contactEmail,
  });

  // Re-check status after ensurePartner (newly created partners are pending_approval)
  if (partner.status !== "approved") {
    return NextResponse.json(
      { error: "Partner not approved", details: "Tu cuenta de partner debe estar aprobada antes de enviar solicitudes de eventos." },
      { status: 403 },
    );
  }

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
