import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';

import { PageHeader } from '@/components/ui/PageHeader';
import { basicOg } from '@/lib/seo';

export const metadata: Metadata = basicOg({
  title: 'Events',
  description: 'Agenda de club culture en Barcelona y Madrid: sesiones, listening rooms y encuentros creativos.',
  canonicalPath: '/events',
});

type EventCity = 'barcelona' | 'madrid';
type EventFormat = 'club' | 'listening' | 'talk' | 'gallery';
type TicketStatus = 'tickets' | 'sold_out' | 'rsvp';

type EventItem = {
  slug: string;
  title: string;
  blurb: string;
  city: EventCity;
  format: EventFormat;
  venue: string;
  district: string;
  dateIso: string;
  time: string;
  capacity: number;
  status: TicketStatus;
  tags: string[];
};

const EVENTS: EventItem[] = [
  {
    slug: 'radar-room-01',
    title: 'Radar Room 01',
    blurb: 'Warm-up progresivo y cierre dubby en formato all-nighter.',
    city: 'barcelona',
    format: 'club',
    venue: 'Nave Aurora',
    district: 'Poblenou',
    dateIso: '2026-03-20',
    time: '23:30 - 06:00',
    capacity: 480,
    status: 'tickets',
    tags: ['Techno', 'Peak Time'],
  },
  {
    slug: 'vinyl-session-sants',
    title: 'Vinyl Session: Sants',
    blurb: 'Listening room con selectoras locales y foco en house noventero.',
    city: 'barcelona',
    format: 'listening',
    venue: 'Sala Prisma',
    district: 'Sants',
    dateIso: '2026-03-23',
    time: '20:00 - 23:45',
    capacity: 140,
    status: 'rsvp',
    tags: ['House', 'Vinyl Only'],
  },
  {
    slug: 'mad-underground-forum',
    title: 'MAD Underground Forum',
    blurb: 'Conversatorio con promotoras sobre sostenibilidad de la noche.',
    city: 'madrid',
    format: 'talk',
    venue: 'Espacio Distrito 7',
    district: 'Lavapies',
    dateIso: '2026-03-24',
    time: '19:00 - 21:30',
    capacity: 110,
    status: 'tickets',
    tags: ['Community', 'Talk'],
  },
  {
    slug: 'linea-3-gallery-night',
    title: 'Linea 3 Gallery Night',
    blurb: 'Exposicion audiovisual y directos en formato live-set.',
    city: 'madrid',
    format: 'gallery',
    venue: 'Galeria Linea 3',
    district: 'Malasana',
    dateIso: '2026-03-27',
    time: '21:00 - 01:00',
    capacity: 220,
    status: 'tickets',
    tags: ['Audio Visual', 'Live Set'],
  },
  {
    slug: 'south-loop-warehouse',
    title: 'South Loop Warehouse',
    blurb: 'Formato warehouse con dos salas y curaduria hibrida BCN/MAD.',
    city: 'barcelona',
    format: 'club',
    venue: 'Hangar Delta',
    district: 'Zona Franca',
    dateIso: '2026-03-29',
    time: '00:00 - 07:00',
    capacity: 700,
    status: 'sold_out',
    tags: ['Warehouse', 'Acid'],
  },
  {
    slug: 'roofline-sunset-edit',
    title: 'Roofline Sunset Edit',
    blurb: 'Encuentro de cierre de mes con tempos slow-burn y vista urbana.',
    city: 'madrid',
    format: 'listening',
    venue: 'Terraza Origen',
    district: 'Arganzuela',
    dateIso: '2026-04-02',
    time: '18:30 - 23:00',
    capacity: 260,
    status: 'tickets',
    tags: ['Sunset', 'Slow Burn'],
  },
];

const CITY_OPTIONS: { value: EventCity; label: string }[] = [
  { value: 'barcelona', label: 'Barcelona' },
  { value: 'madrid', label: 'Madrid' },
];

const FORMAT_OPTIONS: { value: EventFormat; label: string }[] = [
  { value: 'club', label: 'Club' },
  { value: 'listening', label: 'Listening' },
  { value: 'talk', label: 'Talk' },
  { value: 'gallery', label: 'Gallery' },
];

function buildHref(city?: EventCity, format?: EventFormat) {
  const params = new URLSearchParams();
  if (city) params.set('city', city);
  if (format) params.set('format', format);
  const query = params.toString();
  return query ? `/events?${query}` : '/events';
}

function cityLabel(city: EventCity) {
  return city === 'barcelona' ? 'Barcelona' : 'Madrid';
}

function formatLabel(format: EventFormat) {
  switch (format) {
    case 'club':
      return 'Club Session';
    case 'listening':
      return 'Listening Room';
    case 'talk':
      return 'Talk';
    case 'gallery':
      return 'Gallery Night';
  }
}

function statusLabel(status: TicketStatus) {
  switch (status) {
    case 'tickets':
      return 'Tickets';
    case 'sold_out':
      return 'Sold Out';
    case 'rsvp':
      return 'RSVP';
  }
}

function statusClass(status: TicketStatus) {
  switch (status) {
    case 'tickets':
      return 'border-accent/60 bg-accent/12 text-accent';
    case 'sold_out':
      return 'border-accent-2/55 bg-accent-2/12 text-red-200';
    case 'rsvp':
      return 'border-border bg-foreground/5 text-foreground';
  }
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${dateIso}T00:00:00`));
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; format?: string }>;
}) {
  const { city, format } = await searchParams;

  const cityFilter = CITY_OPTIONS.find((option) => option.value === city)?.value;
  const formatFilter = FORMAT_OPTIONS.find((option) => option.value === format)?.value;

  const filtered = EVENTS.filter((item) => {
    if (cityFilter && item.city !== cityFilter) return false;
    if (formatFilter && item.format !== formatFilter) return false;
    return true;
  }).sort((a, b) => (a.dateIso < b.dateIso ? -1 : 1));

  const availableCount = filtered.filter((item) => item.status !== 'sold_out').length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        caption="Agenda curada de club culture en Barcelona y Madrid. Filtra por ciudad o formato para escanear la semana y planificar con rapidez."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden border border-border bg-surface p-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.2),transparent_52%)]" />
          <p className="relative font-display text-[10px] font-bold uppercase tracking-[0.26em] text-accent">
            Signal Board
          </p>
          <p className="relative mt-3 max-w-[56ch] text-sm leading-relaxed text-muted">
            Seleccionamos formatos que funcionen tanto para descubrimiento musical como para comunidad local.
            El calendario se actualiza semanalmente y prioriza eventos con narrativa editorial.
          </p>
          <div className="relative mt-5 grid gap-2 sm:grid-cols-3">
            <div className="border border-border bg-background p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">This Week</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{filtered.length}</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Open Spots</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{availableCount}</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">Cities</p>
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">2</p>
            </div>
          </div>
        </div>

        <aside className="border border-border bg-surface p-5">
          <h2 className="font-display text-[12px] font-bold uppercase tracking-[0.2em] text-accent">How to read</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>1. Filtra por ciudad para reducir el ruido.</li>
            <li>2. Usa formato para encontrar el tipo de energia.</li>
            <li>3. Prioriza eventos con badge Tickets o RSVP.</li>
          </ul>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="event-filters-title">
        <h2
          id="event-filters-title"
          className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-muted"
        >
          Filters
        </h2>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref(undefined, formatFilter)}
              className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
            >
              All Cities
            </Link>
            {CITY_OPTIONS.map((option) => {
              const active = cityFilter === option.value;
              return (
                <Link
                  key={option.value}
                  href={buildHref(option.value, formatFilter)}
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

          <div className="flex flex-wrap gap-2">
            <Link
              href={buildHref(cityFilter, undefined)}
              className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
            >
              All Formats
            </Link>
            {FORMAT_OPTIONS.map((option) => {
              const active = formatFilter === option.value;
              return (
                <Link
                  key={option.value}
                  href={buildHref(cityFilter, option.value)}
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
      </section>

      {filtered.length ? (
        <section className="grid gap-3 sm:grid-cols-2" aria-label="Events list">
          {filtered.map((event, index) => (
            <article
              key={event.slug}
              className="event-reveal border border-border bg-surface p-4 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/45"
              style={{ '--stagger': index } as CSSProperties}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                  <span>{formatDate(event.dateIso)}</span>
                  <span className="mx-2 text-border">-</span>
                  <span>{event.time}</span>
                </p>
                <span
                  className={`inline-flex items-center border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] ${statusClass(event.status)}`}
                >
                  {statusLabel(event.status)}
                </span>
              </div>

              <h3 className="mt-2 font-display text-[1.3rem] font-black uppercase leading-tight tracking-[-0.02em]">
                {event.title}
              </h3>

              <p className="mt-2 text-sm text-muted">{event.blurb}</p>

              <dl className="mt-4 grid gap-2 text-xs text-muted sm:grid-cols-3">
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">City</dt>
                  <dd className="mt-1">{cityLabel(event.city)}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Venue</dt>
                  <dd className="mt-1">{event.venue}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Capacity</dt>
                  <dd className="mt-1">{event.capacity} pax</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center border border-border bg-background px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  {formatLabel(event.format)}
                </span>
                <span className="inline-flex items-center border border-border bg-background px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  {event.district}
                </span>
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center border border-border/70 px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="border border-border bg-surface p-6 text-center">
          <h2 className="font-display text-xl font-black uppercase">No events match this filter</h2>
          <p className="mt-2 text-sm text-muted">Prueba otra combinacion de ciudad y formato para ver la agenda completa.</p>
          <Link
            href="/events"
            className="mt-4 inline-flex items-center bg-accent px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground"
          >
            Reset Filters
          </Link>
        </section>
      )}
    </div>
  );
}
