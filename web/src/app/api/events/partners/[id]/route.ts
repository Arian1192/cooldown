import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminAuthenticated } from "@/lib/adminAuth";
import { deletePartner, findPartnerById, updatePartner } from "@/lib/events/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const partner = findPartnerById(id);

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  return NextResponse.json({ data: partner });
}

const PatchBody = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  contactEmail: z.string().email().optional(),
  raProfileUrl: z.string().url().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!isAdminAuthenticated(request)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Cooldown Admin"' },
    });
  }

  const { id } = await params;

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

  const updated = updatePartner(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isAdminAuthenticated(request)) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Cooldown Admin"' },
    });
  }

  const { id } = await params;
  const deleted = deletePartner(id);

  if (!deleted) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
