'use client';

import { usePathname, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/cn';
import type { Locale } from '@/lib/i18n';

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPath = searchParams.size
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  function hrefFor(nextLocale: Locale) {
    const params = new URLSearchParams({
      locale: nextLocale,
      redirect: currentPath,
    });
    return `/api/locale?${params.toString()}`;
  }

  return (
    <div className="inline-flex items-center gap-1 border border-border px-1 py-1">
      <a
        href={hrefFor('es')}
        className={cn(
          'px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors',
          locale === 'es'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted hover:text-foreground',
        )}
      >
        ES
      </a>
      <a
        href={hrefFor('en')}
        className={cn(
          'px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors',
          locale === 'en'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted hover:text-foreground',
        )}
      >
        EN
      </a>
    </div>
  );
}
