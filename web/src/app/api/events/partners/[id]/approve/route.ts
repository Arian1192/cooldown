import { NextRequest, NextResponse } from "next/server";

import { approvePartner } from "@/lib/events/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const partner = approvePartner(id);

  if (!partner) {
    return NextResponse.json({ error: "Partner not found" }, { status: 404 });
  }

  return NextResponse.json({ data: partner });
}
