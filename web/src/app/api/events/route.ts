import { NextResponse } from "next/server";

import { listEvents } from "@/lib/events/store";
import { parseEventFilters } from "@/lib/events/validators";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filters = parseEventFilters(url.searchParams);
  const events = listEvents(filters);

  return NextResponse.json({
    data: events,
    filters,
    total: events.length,
  });
}
