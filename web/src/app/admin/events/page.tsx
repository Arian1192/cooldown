import Link from 'next/link';

import { listEvents } from '@/lib/events/store';
import type { EventOrigin, EventStatus } from '@/lib/events/types';

import { EventStatusToggle } from './EventStatusToggle';

const STATUS_TABS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
];

const STATUS_LABELS: Record<EventStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
};

const STATUS_COLORS: Record<EventStatus, string> = {
  published: 'text-green-300 border-green-400/40 bg-green-400/10',
  draft: 'text-yellow-300 border-yellow-400/40 bg-yellow-400/10',
};

const ORIGIN_LABELS: Record<EventOrigin, string> = {
  native: 'Cooldown',
  partner: 'Partner',
  ra_imported: 'RA',
};

const ORIGIN_COLORS: Record<EventOrigin, string> = {
  native: 'text-[hsl(var(--accent))] border-[hsl(var(--accent)/0.4)] bg-[hsl(var(--accent)/0.08)]',
  partner: 'text-blue-300 border-blue-400/40 bg-blue-400/10',
  ra_imported: 'text-purple-300 border-purple-400/40 bg-purple-400/10',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  club_night: 'Club Night',
  showcase: 'Showcase',
  pop_up: 'Pop-Up',
  workshop: 'Workshop',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface PageProps {
  searchParams: Promise<{ status?: string; origin?: string; city?: string }>;
}

export default async function AdminEventsPage({ searchParams }: PageProps) {
  const { status: rawStatus, origin: rawOrigin, city: rawCity } = await searchParams;

  const validStatuses: EventStatus[] = ['draft', 'published'];
  const validOrigins: EventOrigin[] = ['native', 'partner', 'ra_imported'];

  const activeStatus =
    rawStatus && validStatuses.includes(rawStatus as EventStatus)
      ? (rawStatus as EventStatus)
      : undefined;

  const activeOrigin =
    rawOrigin && validOrigins.includes(rawOrigin as EventOrigin)
      ? (rawOrigin as EventOrigin)
      : undefined;

  const activeCity = rawCity?.trim() || undefined;

  const allEvents = listEvents({ status: activeStatus, origin: activeOrigin });
  const filtered = activeCity
    ? allEvents.filter((e) => e.city.toLowerCase() === activeCity.toLowerCase())
    : allEvents;

  const allCities = [...new Set(listEvents().map((e) => e.city))].sort();

  const publishedCount = listEvents({ status: 'published' }).length;
  const draftCount = listEvents({ status: 'draft' }).length;

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { status: rawStatus, origin: rawOrigin, city: rawCity, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return `/admin/events${qs ? `?${qs}` : ''}`;
  }

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase tracking-[-0.02em]">
            Eventos
          </h1>
          <p className="mt-1 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
            {publishedCount} publicado{publishedCount !== 1 ? 's' : ''} · {draftCount} borrador{draftCount !== 1 ? 'es' : ''}
          </p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-1 border-b border-[hsl(var(--border))]">
        {STATUS_TABS.map((tab) => {
          const isActive = tab.value === 'all' ? !activeStatus : activeStatus === tab.value;
          const href = buildUrl({ status: tab.value === 'all' ? undefined : tab.value });
          return (
            <Link
              key={tab.value}
              href={href}
              className={[
                'px-4 py-2.5 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.16em] transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
                  : 'border-transparent text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Secondary filters: origin + city */}
      <div className="mb-6 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <span className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
            Origen:
          </span>
          {(['native', 'partner', 'ra_imported'] as EventOrigin[]).map((origin) => (
            <Link
              key={origin}
              href={buildUrl({ origin: activeOrigin === origin ? undefined : origin })}
              className={[
                'border px-2.5 py-1 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.16em] transition-colors',
                activeOrigin === origin
                  ? ORIGIN_COLORS[origin]
                  : 'border-[hsl(var(--border))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              ].join(' ')}
            >
              {ORIGIN_LABELS[origin]}
            </Link>
          ))}
        </div>

        {allCities.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
              Ciudad:
            </span>
            {allCities.map((city) => (
              <Link
                key={city}
                href={buildUrl({ city: activeCity === city ? undefined : city })}
                className={[
                  'border px-2.5 py-1 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.16em] transition-colors',
                  activeCity === city
                    ? 'border-[hsl(var(--accent)/0.4)] text-[hsl(var(--accent))] bg-[hsl(var(--accent)/0.08)]'
                    : 'border-[hsl(var(--border))] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
                ].join(' ')}
              >
                {city}
              </Link>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-[hsl(var(--border))] p-10 text-center">
          <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
            No hay eventos con los filtros seleccionados
          </p>
        </div>
      ) : (
        <div className="border border-[hsl(var(--border))] overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Título
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden md:table-cell">
                  Fecha
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden lg:table-cell">
                  Venue
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden sm:table-cell">
                  Ciudad
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Origen
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Estado
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden xl:table-cell">
                  Creado
                </th>
                <th className="px-5 py-3 text-right font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {filtered.map((event) => (
                <tr
                  key={event.id}
                  className="bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-[family-name:var(--font-barlow)] font-bold uppercase tracking-[-0.01em] leading-tight">
                        {event.title}
                      </p>
                      <p className="mt-0.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
                        {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-[hsl(var(--muted))]">{formatDate(event.date)}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-[hsl(var(--muted))]">{event.venue}</span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-xs text-[hsl(var(--muted))]">{event.city}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.2em] ${ORIGIN_COLORS[event.origin]}`}
                    >
                      {ORIGIN_LABELS[event.origin]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.2em] ${STATUS_COLORS[event.status]}`}
                    >
                      {STATUS_LABELS[event.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span className="text-xs text-[hsl(var(--muted))]">{formatDate(event.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <EventStatusToggle eventId={event.id} currentStatus={event.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
