import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/ui/PageHeader';
import { getEventBySlug } from '@/lib/events/store';
import type { EventRecord, EventType } from '@/lib/events/types';
import { basicOg } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event) return {};

  return basicOg({
    title: event.title,
    description: event.description ?? `${event.eventType.replace('_', ' ')} at ${event.venue}, ${event.city}`,
    canonicalPath: `/events/${slug}`,
    type: 'article',
    publishedTime: event.date,
    tags: event.genres,
  });
}

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  club_night: 'Club Night',
  showcase: 'Showcase',
  pop_up: 'Pop-Up',
  workshop: 'Workshop',
};

type TicketState = 'tickets' | 'sold_out' | 'rsvp' | 'free';

function ticketState(event: EventRecord): TicketState {
  if (event.priceEur === 0) return 'free';
  if (!event.ticketUrl) return 'rsvp';
  return 'tickets';
}

function ticketLabel(state: TicketState): string {
  switch (state) {
    case 'tickets': return 'Tickets';
    case 'sold_out': return 'Sold Out';
    case 'rsvp': return 'RSVP';
    case 'free': return 'Free Entry';
  }
}

function ticketClass(state: TicketState): string {
  switch (state) {
    case 'tickets': return 'border-accent/60 bg-accent/12 text-accent';
    case 'sold_out': return 'border-accent-2/55 bg-accent-2/12 text-red-200';
    case 'rsvp': return 'border-border bg-foreground/5 text-foreground';
    case 'free': return 'border-lime-400/50 bg-lime-400/10 text-lime-200';
  }
}

function formatEventDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function originLabel(origin: EventRecord['origin']) {
  switch (origin) {
    case 'native': return 'Cooldown';
    case 'partner': return 'Partner';
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

function buildJsonLd(event: EventRecord) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicEvent',
    name: event.title,
    description: event.description,
    startDate: event.date,
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: event.organizer,
    },
    ...(event.ticketUrl ? { url: event.ticketUrl } : {}),
    ...(event.priceEur != null
      ? {
          offers: {
            '@type': 'Offer',
            price: event.priceEur,
            priceCurrency: 'EUR',
            url: event.ticketUrl,
          },
        }
      : {}),
    performer: event.lineUp.map((name) => ({ '@type': 'Person', name })),
    genre: event.genres,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) notFound();

  const state = ticketState(event);
  const jsonLd = buildJsonLd(event);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="space-y-8">
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            ← Events
          </Link>
          <PageHeader
            title={event.title}
            caption={event.description}
            className="mt-4"
          />
        </div>

        {/* Status + badges row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center border px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] ${ticketClass(state)}`}
          >
            {ticketLabel(state)}
          </span>
          <span
            className={`inline-flex items-center border px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] ${originClass(event.origin)}`}
          >
            {originLabel(event.origin)}
          </span>
          <span className="inline-flex items-center border border-border bg-background px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            {EVENT_TYPE_LABELS[event.eventType]}
          </span>
        </div>

        {/* Main info grid */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {/* Date & Venue */}
            <div className="border border-border bg-surface p-5">
              <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                When & Where
              </h2>
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Date</dt>
                  <dd className="mt-1 text-sm">{formatEventDate(event.date)}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Venue</dt>
                  <dd className="mt-1 text-sm">{event.venue}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">City</dt>
                  <dd className="mt-1 text-sm">{event.city}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Organizer</dt>
                  <dd className="mt-1 text-sm">{event.organizer}</dd>
                </div>
              </dl>
            </div>

            {/* Lineup */}
            {event.lineUp.length > 0 && (
              <div className="border border-border bg-surface p-5">
                <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                  Line-Up
                </h2>
                <ul className="mt-4 space-y-2">
                  {event.lineUp.map((artist) => (
                    <li
                      key={artist}
                      className="border-l-2 border-accent/40 pl-3 font-display text-sm font-bold uppercase tracking-[0.06em]"
                    >
                      {artist}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Genres */}
            {event.genres.length > 0 && (
              <div className="border border-border bg-surface p-5">
                <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                  Genres
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {event.genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center border border-border bg-background px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tickets / Price */}
            <div className="border border-border bg-surface p-5">
              <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-accent">
                Tickets
              </h2>
              <div className="mt-4 space-y-3">
                {event.priceEur != null && (
                  <div>
                    <p className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-muted">Price</p>
                    <p className="mt-1 font-display text-2xl font-black uppercase">
                      {event.priceEur === 0 ? 'Free' : `€${event.priceEur}`}
                    </p>
                  </div>
                )}
                {event.ticketUrl ? (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center border border-accent bg-accent px-4 py-3 font-display text-[11px] font-black uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Get Tickets →
                  </a>
                ) : (
                  <p className="text-sm text-muted">
                    No ticket link available. Check the venue directly.
                  </p>
                )}
              </div>
            </div>

            {/* Source info */}
            {event.source.sourceUrl && (
              <div className="border border-border bg-surface p-5">
                <h2 className="font-display text-[11px] font-bold uppercase tracking-[0.24em] text-muted">
                  Source
                </h2>
                <a
                  href={event.source.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center border border-border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
                >
                  View original →
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Back CTA */}
        <div className="border border-border bg-surface p-5">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.26em] text-accent">
            More Events
          </p>
          <p className="mt-2 text-sm text-muted">
            Descubre más eventos de club culture en Barcelona y Madrid.
          </p>
          <Link
            href="/events"
            className="mt-4 inline-flex items-center border border-border px-5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    </>
  );
}
