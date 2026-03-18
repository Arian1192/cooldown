import { NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/adminAuth";
import { deleteEvent, updateEvent } from "@/lib/events/store";

const PatchBody = z.object({
  status: z.enum(["draft", "published"]).optional(),
  title: z.string().min(1).optional(),
  date: z.string().optional(),
  description: z.string().nullable().optional(),
  venue: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  eventType: z.enum(["club_night", "showcase", "pop_up", "workshop"]).optional(),
  priceEur: z.number().int().nonnegative().nullable().optional(),
});

interface RouteContext {
  params: Promise<{ eventId: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isAdminAuthenticated(request)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Cooldown Admin"' },
    });
  }

  const { eventId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PatchBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updated = updateEvent(eventId, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isAdminAuthenticated(request)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Cooldown Admin"' },
    });
  }

  const { eventId } = await params;
  const deleted = deleteEvent(eventId);

  if (!deleted) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
