import { NextResponse } from "next/server";

import { listPartners } from "@/lib/events/store";

export async function GET() {
  const partners = listPartners();

  return NextResponse.json({
    data: partners,
    total: partners.length,
  });
}
