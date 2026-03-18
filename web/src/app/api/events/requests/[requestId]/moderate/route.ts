import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { eventApproved } from "@/lib/email/templates/event-approved";
import {
  createEvent,
  findEventRequestById,
  findPartnerById,
  updateEventRequest,
} from "@/lib/events/store";
import { parseModerationPayload } from "@/lib/events/validators";

interface RouteContext {
  params: Promise<{ requestId: string }>;
}

function applyRequestPatch(
  current: Record<string, unknown>,
  patch?: Record<string, unknown>,
): Record<string, unknown> {
  if (!patch) {
    return current;
  }

  return {
    ...current,
    ...patch,
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  const { requestId } = await context.params;
  const target = findEventRequestById(requestId);

  if (!target) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = parseModerationPayload(payload);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: "Validation failed",
        details: parsed.errors,
      },
      { status: 400 },
    );
  }

  if (parsed.data.action === "edit") {
    const merged = applyRequestPatch(
      target as unknown as Record<string, unknown>,
      parsed.data.patch,
    );

    const updated = updateEventRequest(requestId, {
      ...target,
      ...merged,
      moderationNotes: parsed.data.moderationNotes ?? target.moderationNotes,
    });

    return NextResponse.json({
      message: "Request updated by moderation",
      data: updated,
    });
  }

  if (parsed.data.action === "reject") {
    const updated = updateEventRequest(requestId, {
      status: "rejected",
      moderationNotes: parsed.data.moderationNotes,
    });

    return NextResponse.json({
      message: "Request rejected",
      data: updated,
    });
  }

  const publishedEvent = createEvent({
    title: target.title,
    description: target.description,
    date: target.date,
    city: target.city,
    venue: target.venue,
    organizer: target.partnerName,
    genres: target.genres,
    lineUp: target.lineUp,
    eventType: target.eventType,
    priceEur: target.priceEur,
    ticketUrl: target.ticketUrl,
    origin: "partner",
    status: "published",
    source: {
      source: "partner_portal",
      sourceUrl: target.sourceRaUrl,
      importedAt: new Date().toISOString(),
    },
  });

  const updatedRequest = updateEventRequest(requestId, {
    status: "approved",
    linkedEventId: publishedEvent.id,
    moderationNotes: parsed.data.moderationNotes,
  });

  const partner = findPartnerById(target.partnerId);
  if (partner) {
    void sendEmail({
      to: partner.contactEmail,
      subject: "Tu evento está publicado en Cooldown",
      html: eventApproved({
        partnerName: partner.name,
        eventTitle: publishedEvent.title,
        eventDate: publishedEvent.date,
        eventVenue: publishedEvent.venue,
        eventCity: publishedEvent.city,
        eventSlug: publishedEvent.slug,
      }),
    });
  }

  return NextResponse.json({
    message: "Request approved and event published",
    data: {
      request: updatedRequest,
      event: publishedEvent,
    },
  });
}
