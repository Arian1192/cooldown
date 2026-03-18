import { NextRequest, NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/resend";
import { partnerRegistrationReceived } from "@/lib/email/templates/partner-registration-received";
import { ensurePartner, listPartners } from "@/lib/events/store";

export async function GET() {
  const partners = listPartners();

  return NextResponse.json({
    data: partners,
    total: partners.length,
  });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.push("El nombre del club/marca/empresa es obligatorio.");
  }
  if (!data.contactEmail || typeof data.contactEmail !== "string" || !data.contactEmail.includes("@")) {
    errors.push("El email de contacto debe ser válido.");
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 422 });
  }

  const partner = ensurePartner({
    partnerName: (data.name as string).trim(),
    slug: typeof data.slug === "string" ? data.slug.trim() || undefined : undefined,
    contactEmail: (data.contactEmail as string).trim(),
    raProfileUrl: typeof data.raProfileUrl === "string" && data.raProfileUrl.trim() ? data.raProfileUrl.trim() : undefined,
    description: typeof data.description === "string" && data.description.trim() ? data.description.trim() : undefined,
  });

  void sendEmail({
    to: partner.contactEmail,
    subject: "Solicitud de partner recibida — Cooldown",
    html: partnerRegistrationReceived({ partnerName: partner.name, contactEmail: partner.contactEmail }),
  });

  return NextResponse.json({ data: partner }, { status: 201 });
}
