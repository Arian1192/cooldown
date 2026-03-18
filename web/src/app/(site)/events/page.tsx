import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { listEvents } from '@/lib/events/store';
import type { EventRecord, EventType } from '@/lib/events/types';
import { basicOg } from '@/lib/seo';

export const metadata: Metadata = basicOg({
  title: 'Events',
  description: 'Agenda de club culture en Barcelona y Madrid: sesiones, listening rooms y encuentros creativos.',
  canonicalPath: '/events',
});

type DateFilter = 'next_7_days' | 'this_month' | 'next_month';

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'next_7_days', label: 'Next 7 Days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'next_month', label: 'Next Month' },
];

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  club_night: 'Club Night',
  showcase: 'Showcase',
  pop_up: 'Pop-Up',
  workshop: 'Workshop',
};

function buildHref(filters: { organizer?: string; genre?: string; date?: DateFilter }) {
  const params = new URLSearchParams();
  if (filters.organizer) params.set('organizer', filters.organizer);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.date) params.set('date', filters.date);
  const query = params.toString();
  return query ? `/events?${query}` : '/events';
}

function dateRangeForFilter(filter: DateFilter): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');

  if (filter === 'next_7_days') {
    const from = now.toISOString().slice(0, 10);
    const toDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { dateFrom: from, dateTo: toDate.toISOString().slice(0, 10) };
  }

  if (filter === 'this_month') {
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const lastDay = new Date(y, m, 0).getDate();
    return { dateFrom: `${y}-${pad(m)}-01`, dateTo: `${y}-${pad(m)}-${lastDay}` };
  }

  // next_month
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const y = nextMonthDate.getFullYear();
  const m = nextMonthDate.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return { dateFrom: `${y}-${pad(m)}-01`, dateTo: `${y}-${pad(m)}-${lastDay}` };
}

function matchesDateFilter(dateIso: string, filter: DateFilter | undefined): boolean {
  if (!filter) return true;
  const { dateFrom, dateTo } = dateRangeForFilter(filter);
  const d = dateIso.slice(0, 10);
  return d >= dateFrom && d <= dateTo;
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${dateIso.slice(0, 10)}T00:00:00`));
}

type TicketState = 'tickets' | 'free' | 'rsvp';

function ticketState(event: EventRecord): TicketState {
  if (event.priceEur === 0) return 'free';
  if (event.ticketUrl) return 'tickets';
  return 'rsvp';
}

function ticketLabel(state: TicketState): string {
  switch (state) {
    case 'tickets': return 'Tickets';
    case 'free': return 'Free Entry';
    case 'rsvp': return 'RSVP';
  }
}

function ticketClass(state: TicketState): string {
  switch (state) {
    case 'tickets': return 'border-accent/60 bg-accent/12 text-accent';
    case 'free': return 'border-lime-400/50 bg-lime-400/10 text-lime-200';
    case 'rsvp': return 'border-border bg-foreground/5 text-foreground';
  }
}

function originLabel(origin: EventRecord['origin']) {
  switch (origin) {
    case 'native': return 'Cooldown Verified';
    case 'partner': return 'Partner Event';
    case 'ra_imported': return 'Imported from RA';
  }
}

function originClass(origin: EventRecord['origin']) {
  switch (origin) {
    case 'native': return 'border-lime-400/50 bg-lime-400/10 text-lime-200';
    case 'partner': return 'border-sky-400/50 bg-sky-400/10 text-sky-100';
    case 'ra_imported': return 'border-violet-400/50 bg-violet-400/10 text-violet-100';
  }
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ organizer?: string; genre?: string; date?: string }>;
}) {
  const { organizer, genre, date } = await searchParams;

  const allEvents = listEvents({ status: 'published' });

  const dateFilter = DATE_OPTIONS.find((o) => o.value === date)?.value;

  const filtered = allEvents
    .filter((event) => {
      if (organizer && event.organizer !== organizer) return false;
      if (genre && !event.genres.some((g) => g.toLowerCase() === genre.toLowerCase())) return false;
      if (!matchesDateFilter(event.date, dateFilter)) return false;
      return true;
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const organizerOptions = Array.from(new Set(allEvents.map((e) => e.organizer))).sort();
  const genreOptions = Array.from(new Set(allEvents.flatMap((e) => e.genres))).sort();

  const featuredEvents = filtered.filter((e) => e.origin === 'partner');
  const availableCount = filtered.filter((e) => e.ticketUrl || e.priceEur === 0).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        caption="Agenda curada de club culture. Filtra por organizador, fecha o genero para ver rapidamente eventos confirmados, partner events e importaciones de RA."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden border border-border bg-surface p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.2),transparent_52%)]" />
          <p className="relative font-display text-[10px] font-bold uppercase tracking-[0.26em] text-accent">Signal Board</p>
          <p className="relative mt-3 max-w-[54ch] text-sm leading-relaxed text-muted">
            Vista simplificada para descubrir eventos por quien organiza, cuando sucede y que sonido propone.
          </p>
          <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
            <div className="border border-border bg-background p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Visible</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{filtered.length}</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Open Spots</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{availableCount}</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Featured</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{featuredEvents.length}</p>
            </div>
          </div>
        </div>

        <aside className="border border-border bg-surface p-5">
          <h2 className="font-display text-[12px] font-bold uppercase tracking-[0.2em] text-accent">How to read</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>1. Organizador: quien publica y responde el evento.</li>
            <li>2. Fecha: usa Next 7 Days para plan semanal.</li>
            <li>3. Origen: Verified, Partner o Imported from RA.</li>
          </ul>
        </aside>
      </section>

      {featuredEvents.length > 0 ? (
        <section className="space-y-3" aria-labelledby="partner-highlights-title">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="partner-highlights-title"
              className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-muted"
            >
              Partner Highlights
            </h2>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              {featuredEvents.length} featured
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featuredEvents.map((event) => (
              <article key={`partner-${event.slug}`} className="border border-border bg-surface p-4">
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-accent">{event.organizer}</p>
                <h3 className="mt-2 font-display text-xl font-black uppercase leading-tight">{event.title}</h3>
                {event.description && (
                  <p className="mt-2 text-sm text-muted">{event.description}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] ${originClass(event.origin)}`}
                  >
                    {originLabel(event.origin)}
                  </span>
                  <span className="inline-flex items-center border border-border bg-background px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    {formatDate(event.date)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4" aria-labelledby="event-filters-title">
        <h2
          id="event-filters-title"
          className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-muted"
        >
          Filters
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Organizer</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ genre, date: dateFilter })}
                className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                All
              </Link>
              {organizerOptions.map((opt) => {
                const active = organizer === opt;
                return (
                  <Link
                    key={opt}
                    href={buildHref({ organizer: opt, genre, date: dateFilter })}
                    aria-pressed={active}
                    className={`inline-flex items-center border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:border-accent hover:text-accent'
                    }`}
                  >
                    {opt}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Genre</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ organizer, date: dateFilter })}
                className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                All
              </Link>
              {genreOptions.map((opt) => {
                const active = genre?.toLowerCase() === opt.toLowerCase();
                return (
                  <Link
                    key={opt}
                    href={buildHref({ organizer, genre: opt, date: dateFilter })}
                    aria-pressed={active}
                    className={`inline-flex items-center border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:border-accent hover:text-accent'
                    }`}
                  >
                    {opt}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Date</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ organizer, genre })}
                className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                All
              </Link>
              {DATE_OPTIONS.map((option) => {
                const active = dateFilter === option.value;
                return (
                  <Link
                    key={option.value}
                    href={buildHref({ organizer, genre, date: option.value })}
                    aria-pressed={active}
                    className={`inline-flex items-center border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      active
                        ? 'border-accent bg-accent text-accent-foreground'
                        : 'border-border hover:border-accent hover:text-accent'
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {filtered.length ? (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="Events list">
          {filtered.map((event, index) => {
            const state = ticketState(event);
            return (
              <Link
                key={event.slug}
                href={`/events/${event.slug}`}
                className="event-reveal block border border-border bg-surface p-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/45"
                style={{ '--stagger': index } as CSSProperties}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                    {formatDate(event.date)}
                  </p>
                  <span
                    className={`inline-flex items-center border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] ${ticketClass(state)}`}
                  >
                    {ticketLabel(state)}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-[1.3rem] font-black uppercase leading-tight tracking-[-0.02em]">
                  {event.title}
                </h3>

                {event.description && (
                  <p className="mt-2 text-sm text-muted">{event.description}</p>
                )}

                <dl className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-3">
                  <div>
                    <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Organizer</dt>
                    <dd className="mt-1">{event.organizer}</dd>
                  </div>
                  <div>
                    <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Where</dt>
                    <dd className="mt-1">{event.venue} · {event.city}</dd>
                  </div>
                  <div>
                    <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Format</dt>
                    <dd className="mt-1">{EVENT_TYPE_LABELS[event.eventType]}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] ${originClass(event.origin)}`}
                  >
                    {originLabel(event.origin)}
                  </span>
                  {event.genres.slice(0, 2).map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center border border-border bg-background px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="border border-border bg-surface p-6 text-center">
          <h2 className="font-display text-xl font-black uppercase">No events match this filter</h2>
          <p className="mt-2 text-sm text-muted">Prueba otra combinacion de filtros para ver la agenda completa.</p>
          <Link
            href="/events"
            className="mt-4 inline-flex items-center bg-accent px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground"
          >
            Reset Filters
          </Link>
        </section>
      )}

      <section className="border border-border bg-surface p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,hsl(var(--accent)/0.1),transparent_50%)]" />
        <p className="relative font-display text-[10px] font-bold uppercase tracking-[0.26em] text-accent">
          ¿Organizas un evento?
        </p>
        <p className="relative mt-2 max-w-[60ch] text-sm text-muted">
          Clubs, promotoras y colectivos pueden enviar sus propuestas para que aparezcan en la agenda de Cooldown.
        </p>
        <div className="relative mt-4 flex flex-wrap gap-3">
          <Link
            href="/events/submit"
            className="inline-flex items-center bg-accent px-5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Submit Event →
          </Link>
          <Link
            href="/partners/join"
            className="inline-flex items-center border border-border px-5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            Hazte Partner →
          </Link>
        </div>
      </section>
    </div>
  );
}
