'use client';

import { useEffect, useRef } from 'react';

import { trackEvent } from '@/lib/observability/client';

type TelemetryValue = string | number | boolean | null;
type TelemetryPayload = Record<string, TelemetryValue>;

export function TrackEventOnRender({
  name,
  payload,
}: {
  name: 'search_performed' | 'detail_viewed';
  payload: TelemetryPayload;
}) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) return;
    trackEvent(name, payload);
    hasTrackedRef.current = true;
  }, [name, payload]);

  return null;
}
