'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/cn';

export function SortToggle({
  current,
}: {
  current: 'asc' | 'desc';
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(order: 'asc' | 'desc') {
    const params = new URLSearchParams(searchParams.toString());
    if (order === 'desc') {
      params.delete('order');
    } else {
      params.set('order', order);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href={hrefFor('desc')}
        className={cn(
          'px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors',
          current === 'desc'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted hover:text-foreground',
        )}
        scroll={false}
      >
        Newest
      </Link>
      <Link
        href={hrefFor('asc')}
        className={cn(
          'px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors',
          current === 'asc'
            ? 'bg-accent text-accent-foreground'
            : 'text-muted hover:text-foreground',
        )}
        scroll={false}
      >
        Oldest
      </Link>
    </div>
  );
}
