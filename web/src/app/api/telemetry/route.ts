import { NextResponse, type NextRequest } from 'next/server';

import { logServerEvent } from '@/lib/observability/server';

type TelemetryValue = string | number | boolean | null;
type TelemetryPayload = Record<string, TelemetryValue>;
type TelemetryEventName = 'search_performed' | 'detail_viewed' | 'runtime_error';

function isValidName(name: unknown): name is TelemetryEventName {
  return (
    name === 'search_performed' ||
    name === 'detail_viewed' ||
    name === 'runtime_error'
  );
}

function sanitizePayload(input: unknown): TelemetryPayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const record = input as Record<string, unknown>;
  const entries = Object.entries(record)
    .filter(([, value]) => {
      return (
        value == null ||
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      );
    })
    .slice(0, 24)
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value.slice(0, 240)] as const;
      }
      return [key, (value ?? null) as TelemetryValue] as const;
    });

  return Object.fromEntries(entries);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: unknown;
      payload?: unknown;
      path?: unknown;
    };

    if (!isValidName(body.name)) {
      return NextResponse.json({ ok: false, error: 'invalid event name' }, { status: 400 });
    }

    logServerEvent(body.name, {
      ...sanitizePayload(body.payload),
      path: typeof body.path === 'string' ? body.path.slice(0, 240) : null,
      source: 'client',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logServerEvent('runtime_error', {
      source: 'telemetry-api',
      message: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
