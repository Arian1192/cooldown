'use client';

import { useEffect, useMemo } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';

function detectLocale() {
  if (typeof navigator === 'undefined') return 'en';
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useMemo(() => detectLocale(), []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="500"
        caption={
          locale === 'en' ? 'Something went wrong.' : 'Algo ha salido mal.'
        }
      />
      <button
        className="inline-flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
        onClick={() => reset()}
        type="button"
      >
        {locale === 'en' ? 'Try again' : 'Reintentar'}
      </button>
    </div>
  );
}
