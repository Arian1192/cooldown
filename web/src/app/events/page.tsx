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
type EventOrigin = 'cooldown_verified' | 'partner_event' | 'ra_imported';
type Genre = 'techno' | 'house' | 'electro' | 'ambient' | 'community';
type DateFilter = 'all' | 'next_7_days' | 'march_2026' | 'april_2026';

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
  origin: EventOrigin;
  organizer: string;
  genre: Genre;
  featuredPartner: boolean;
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
    tags: ['Peak Time', 'All Nighter'],
    origin: 'cooldown_verified',
    organizer: 'Cooldown',
    genre: 'techno',
    featuredPartner: false,
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
    tags: ['Vinyl Only', 'Deep'],
    origin: 'partner_event',
    organizer: 'Sala Prisma',
    genre: 'house',
    featuredPartner: true,
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
    tags: ['Roundtable', 'Industry'],
    origin: 'ra_imported',
    organizer: 'Underground Alliance',
    genre: 'community',
    featuredPartner: false,
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
    tags: ['AV', 'Live Set'],
    origin: 'partner_event',
    organizer: 'Linea 3 Collective',
    genre: 'electro',
    featuredPartner: true,
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
    origin: 'ra_imported',
    organizer: 'Pulse Norte',
    genre: 'techno',
    featuredPartner: false,
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
    origin: 'cooldown_verified',
    organizer: 'Cooldown',
    genre: 'ambient',
    featuredPartner: false,
  },
];

const ORGANIZER_OPTIONS = Array.from(new Set(EVENTS.map((event) => event.organizer))).map((organizer) => ({
  value: organizer,
  label: organizer,
}));

const GENRE_OPTIONS: { value: Genre; label: string }[] = [
  { value: 'techno', label: 'Techno' },
  { value: 'house', label: 'House' },
  { value: 'electro', label: 'Electro' },
  { value: 'ambient', label: 'Ambient' },
  { value: 'community', label: 'Community' },
];

const DATE_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: 'next_7_days', label: 'Next 7 Days' },
  { value: 'march_2026', label: 'March 2026' },
  { value: 'april_2026', label: 'April 2026' },
];

function buildHref(filters: { organizer?: string; genre?: Genre; date?: DateFilter }) {
  const params = new URLSearchParams();
  if (filters.organizer) params.set('organizer', filters.organizer);
  if (filters.genre) params.set('genre', filters.genre);
  if (filters.date) params.set('date', filters.date);
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

function originLabel(origin: EventOrigin) {
  switch (origin) {
    case 'cooldown_verified':
      return 'Cooldown Verified';
    case 'partner_event':
      return 'Partner Event';
    case 'ra_imported':
      return 'Imported from RA';
  }
}

function originClass(origin: EventOrigin) {
  switch (origin) {
    case 'cooldown_verified':
      return 'border-lime-400/50 bg-lime-400/10 text-lime-200';
    case 'partner_event':
      return 'border-sky-400/50 bg-sky-400/10 text-sky-100';
    case 'ra_imported':
      return 'border-violet-400/50 bg-violet-400/10 text-violet-100';
  }
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${dateIso}T00:00:00`));
}

function matchesDateFilter(dateIso: string, dateFilter: DateFilter | undefined) {
  if (!dateFilter || dateFilter === 'all') return true;

  if (dateFilter === 'next_7_days') {
    const eventTime = new Date(`${dateIso}T00:00:00Z`).getTime();
    const start = new Date('2026-03-19T00:00:00Z').getTime();
    const end = new Date('2026-03-26T23:59:59Z').getTime();
    return eventTime >= start && eventTime <= end;
  }

  if (dateFilter === 'march_2026') return dateIso.startsWith('2026-03');
  return dateIso.startsWith('2026-04');
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ organizer?: string; genre?: string; date?: string }>;
}) {
  const { organizer, genre, date } = await searchParams;

  const organizerFilter = ORGANIZER_OPTIONS.find((option) => option.value === organizer)?.value;
  const genreFilter = GENRE_OPTIONS.find((option) => option.value === genre)?.value;
  const dateFilter = DATE_OPTIONS.find((option) => option.value === date)?.value;

  const filtered = EVENTS.filter((item) => {
    if (organizerFilter && item.organizer !== organizerFilter) return false;
    if (genreFilter && item.genre !== genreFilter) return false;
    if (!matchesDateFilter(item.dateIso, dateFilter)) return false;
    return true;
  }).sort((a, b) => (a.dateIso < b.dateIso ? -1 : 1));

  const featuredPartners = filtered.filter((event) => event.featuredPartner);
  const availableCount = filtered.filter((item) => item.status !== 'sold_out').length;

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
              <p className="mt-2 font-display text-2xl font-black uppercase leading-none">{featuredPartners.length}</p>
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

      {featuredPartners.length > 0 ? (
        <section className="space-y-3" aria-labelledby="partner-highlights-title">
          <div className="flex items-center justify-between gap-2">
            <h2
              id="partner-highlights-title"
              className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-muted"
            >
              Partner Highlights
            </h2>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
              {featuredPartners.length} featured
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {featuredPartners.map((event) => (
              <article key={`partner-${event.slug}`} className="border border-border bg-surface p-4">
                <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-accent">{event.organizer}</p>
                <h3 className="mt-2 font-display text-xl font-black uppercase leading-tight">{event.title}</h3>
                <p className="mt-2 text-sm text-muted">{event.blurb}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] ${originClass(event.origin)}`}
                  >
                    {originLabel(event.origin)}
                  </span>
                  <span className="inline-flex items-center border border-border bg-background px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    {formatDate(event.dateIso)}
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
                href={buildHref({ genre: genreFilter, date: dateFilter })}
                className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                All
              </Link>
              {ORGANIZER_OPTIONS.map((option) => {
                const active = organizerFilter === option.value;
                return (
                  <Link
                    key={option.value}
                    href={buildHref({ organizer: option.value, genre: genreFilter, date: dateFilter })}
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

          <div className="space-y-2">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Genre</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ organizer: organizerFilter, date: dateFilter })}
                className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                All
              </Link>
              {GENRE_OPTIONS.map((option) => {
                const active = genreFilter === option.value;
                return (
                  <Link
                    key={option.value}
                    href={buildHref({ organizer: organizerFilter, genre: option.value, date: dateFilter })}
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

          <div className="space-y-2">
            <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Date</p>
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ organizer: organizerFilter, genre: genreFilter })}
                className="inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
              >
                All
              </Link>
              {DATE_OPTIONS.map((option) => {
                const active = dateFilter === option.value;
                return (
                  <Link
                    key={option.value}
                    href={buildHref({ organizer: organizerFilter, genre: genreFilter, date: option.value })}
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
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Organizer</dt>
                  <dd className="mt-1">{event.organizer}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Where</dt>
                  <dd className="mt-1">
                    {event.venue} · {cityLabel(event.city)}
                  </dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-foreground">Format</dt>
                  <dd className="mt-1">{formatLabel(event.format)}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] ${originClass(event.origin)}`}
                >
                  {originLabel(event.origin)}
                </span>
                <span className="inline-flex items-center border border-border bg-background px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                  {event.genre}
                </span>
                {event.tags.slice(0, 1).map((tag) => (
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
          <p className="mt-2 text-sm text-muted">Prueba otra combinacion de filtros para ver la agenda completa.</p>
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
