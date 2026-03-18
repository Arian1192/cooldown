'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/admin/requests', label: 'Solicitudes de eventos' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/events', label: 'Eventos publicados' },
  { href: '/admin/events/import', label: 'Importar RA' },
];

const SECTION_LABELS: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/requests': 'Solicitudes de eventos',
  '/admin/partners': 'Partners',
  '/admin/events/import': 'Importar RA',
  '/admin/events': 'Eventos publicados',
};

export function AdminNav() {
  const pathname = usePathname();

  const sectionLabel =
    Object.entries(SECTION_LABELS)
      .filter(([key]) => pathname.startsWith(key))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? 'Admin';

  return (
    <>
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-[hsl(var(--border))] flex flex-col">
        <div className="h-14 flex items-center px-5 border-b border-[hsl(var(--border))]">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-barlow)] text-xs uppercase tracking-[0.22em] text-[hsl(var(--accent))] hover:opacity-80 transition-opacity"
          >
            Admin
          </Link>
        </div>

        <nav className="flex-1 py-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'block px-5 py-2.5 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.16em] transition-colors',
                  active
                    ? 'text-[hsl(var(--foreground))] bg-[hsl(var(--surface))]'
                    : 'text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 pb-4">
          <Link
            href="/"
            className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Top header strip (section name) */}
      <div
        className="absolute top-0 left-52 right-0 h-14 border-b border-[hsl(var(--border))] flex items-center px-6"
        aria-hidden="true"
      >
        <span className="font-[family-name:var(--font-barlow)] text-xs uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
          {sectionLabel}
        </span>
      </div>
    </>
  );
}
