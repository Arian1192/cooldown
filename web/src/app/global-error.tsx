'use client';

import Link from 'next/link';
import { useMemo } from 'react';

function detectLocale() {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const locale = useMemo(() => detectLocale(), []);

  return (
    <html lang={locale}>
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1>500</h1>
        <p>
          {locale === 'en'
            ? 'Global error boundary triggered.'
            : 'Se activo el limite global de errores.'}
        </p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{String(error.message)}</pre>
        <p>
          <Link href="/">{locale === 'en' ? 'Back home' : 'Volver al inicio'}</Link>
        </p>
      </body>
    </html>
  );
}
