'use client';

import { useEffect } from 'react';

import { reportClientError } from '@/lib/observability/client';

export function RuntimeObservability() {
  useEffect(() => {
    const onUnhandledError = (event: ErrorEvent) => {
      reportClientError(event.error ?? event.message, {
        source: 'window.error',
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      reportClientError(event.reason, {
        source: 'window.unhandledrejection',
      });
    };

    window.addEventListener('error', onUnhandledError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onUnhandledError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
