import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { partnerRejected } from "@/lib/email/templates/partner-rejected";
import { rejectPartner } from "@/lib/events/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  let reason: string | undefined;
  try {
    const body = await request.json();
    if (body && typeof body.reason === "string" && body.reason.trim()) {
      reason = body.reason.trim();
    }
  } catch {
    // body is optional
  }

  const partner = rejectPartner(id, reason);

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  void sendEmail({
    to: partner.contactEmail,
    subject: "Actualización de tu solicitud — Cooldown Partners",
    html: partnerRejected({ partnerName: partner.name, reason }),
  });

  return NextResponse.json({ data: partner });
}
