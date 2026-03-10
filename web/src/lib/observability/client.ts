'use client';

type TelemetryValue = string | number | boolean | null;
type TelemetryPayload = Record<string, TelemetryValue>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: TelemetryPayload) => void;
    };
  }
}

type TelemetryEventName = 'search_performed' | 'detail_viewed' | 'runtime_error';

function normalizePayload(
  payload: TelemetryPayload | undefined,
): TelemetryPayload | undefined {
  if (!payload) return undefined;
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => {
      if (typeof value === 'string') {
        return [key, value.slice(0, 240)];
      }
      return [key, value];
    }),
  );
}

function sendToInternalEndpoint(name: TelemetryEventName, payload?: TelemetryPayload) {
  const body = JSON.stringify({
    name,
    payload: normalizePayload(payload),
    path: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/telemetry', body);
    return;
  }

  void fetch('/api/telemetry', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  });
}

export function trackEvent(name: TelemetryEventName, payload?: TelemetryPayload) {
  const normalizedPayload = normalizePayload(payload);
  window.dispatchEvent(
    new CustomEvent('cooldown:telemetry', {
      detail: { name, payload: normalizedPayload },
    }),
  );

  if (window.umami?.track) {
    window.umami.track(name, normalizedPayload);
  }

  sendToInternalEndpoint(name, normalizedPayload);
}

export function reportClientError(
  error: unknown,
  payload: TelemetryPayload = {},
): void {
  const normalizedError =
    error instanceof Error
      ? {
          errorName: error.name,
          errorMessage: error.message,
        }
      : {
          errorName: 'UnknownError',
          errorMessage: String(error),
        };

  trackEvent('runtime_error', {
    ...payload,
    ...normalizedError,
  });
}
