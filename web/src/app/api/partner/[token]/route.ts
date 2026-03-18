import { NextRequest, NextResponse } from "next/server";

import { findPartnerByToken, listEventRequestsByPartnerId } from "@/lib/events/store";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { token } = await params;
  const partner = findPartnerByToken(token);

  if (!partner) {
    return NextResponse.json({ error: "Invalid or expired portal link" }, { status: 404 });
  }

  const requests = listEventRequestsByPartnerId(partner.id);

  return NextResponse.json({
    partner: {
      id: partner.id,
      name: partner.name,
      slug: partner.slug,
      contactEmail: partner.contactEmail,
      raProfileUrl: partner.raProfileUrl,
      description: partner.description,
      status: partner.status,
    },
    requests,
  });
}
