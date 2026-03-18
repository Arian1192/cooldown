import { NextRequest, NextResponse } from "next/server";

import { findPartnerById } from "@/lib/events/store";

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
