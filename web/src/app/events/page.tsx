import type { Metadata } from 'next';
import Link from 'next/link';

import { Card, CardCaption, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { getRequestLocale } from '@/lib/requestLocale';
import {
  formatEventDateLabel,
  getResidentAdvisorEvents,
  type EventCityFilter,
  type RaEvent,
} from '@/lib/raEvents';
import { basicOg } from '@/lib/seo';
import { collectionPageJsonLd } from '@/lib/structuredData';

const CITY_FILTERS: EventCityFilter[] = ['all', 'barcelona', 'madrid'];
const MONTH_FORMAT = /^\d{4}-\d{2}$/;
const DAY_FORMAT = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  return basicOg({
    title: 'Events',
    description:
      locale === 'en'
        ? 'Upcoming electronic music events from Resident Advisor for Barcelona and Madrid.'
        : 'Proximos eventos de musica electronica en Resident Advisor para Barcelona y Madrid.',
    canonicalPath: '/events',
    locale,
  });
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; month?: string; day?: string }>;
}) {
  const locale = await getRequestLocale();
  const { city, month, day } = await searchParams;

  const cityFilter = CITY_FILTERS.includes(city as EventCityFilter)
    ? (city as EventCityFilter)
    : 'all';
  const currentMonth = new Date().toISOString().slice(0, 7);
  const requestedMonth = MONTH_FORMAT.test(month ?? '') ? (month as string) : undefined;
  const requestedDay = DAY_FORMAT.test(day ?? '') ? (day as string) : undefined;
  const activeMonth = requestedDay?.slice(0, 7) ?? requestedMonth ?? currentMonth;
  const monthDate = toDateAtUtc(activeMonth);
  const today = new Date().toISOString().slice(0, 10);
  const fromDate = activeMonth === currentMonth ? today : firstDayOfMonth(activeMonth);
  const toDate = lastDayOfMonth(activeMonth);

  const { events, unavailableCities, generatedAtIso } =
    await getResidentAdvisorEvents({
      city: cityFilter,
      limit: 200,
      fromDate,
      toDate,
    });

  const visibleEvents = events.filter((event) => event.startDateIso.slice(0, 10) >= today);
  const byDay = groupByDay(visibleEvents);
  const calendarDays = buildCalendarDays(activeMonth, byDay);
  const defaultDay =
    calendarDays.find((entry) => entry.count > 0)?.dayKey ??
    (activeMonth === currentMonth ? today : firstDayOfMonth(activeMonth));

  const selectedDay =
    requestedDay && requestedDay.startsWith(activeMonth)
      ? requestedDay
      : defaultDay;

  const selectedEvents = byDay.get(selectedDay) ?? [];
  const monthDayEntries = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  const monthLabel = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate);
  const monthOptions = buildMonthOptions(activeMonth, 1, 2);

  const caption =
    locale === 'en'
      ? 'Monthly calendar with flyer-first event cards for Barcelona and Madrid.'
      : 'Calendario mensual con tarjetas centradas en flyer para Barcelona y Madrid.';

  const jsonLd = collectionPageJsonLd({
    title: 'Events',
    description: caption,
    path: '/events',
    locale,
  });

  const weekDays = weekdayLabels(locale);

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader title="Events" caption={caption} />

      <Card>
        <CardTitle>{locale === 'en' ? 'City filter' : 'Filtro por ciudad'}</CardTitle>
        <CardCaption>
          {locale === 'en'
            ? 'Resident Advisor GraphQL with month/day-driven URL filters.'
            : 'Resident Advisor GraphQL con filtros de mes/dia controlados por URL.'}
        </CardCaption>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {CITY_FILTERS.map((filter) => (
            <Link
              key={filter}
              href={{
                pathname: '/events',
                query: {
                  ...(filter === 'all' ? {} : { city: filter }),
                  month: activeMonth,
                  day: selectedDay,
                },
              }}
              className={
                filter === cityFilter
                  ? 'border border-accent bg-accent px-3 py-2 text-center font-display text-[11px] font-black uppercase tracking-[0.18em] text-accent-foreground'
                  : 'border border-border px-3 py-2 text-center font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-foreground'
              }
            >
              {cityLabel(filter)}
            </Link>
          ))}
        </div>
      </Card>

      {events.length > 0 ? (
        <>
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{locale === 'en' ? 'Calendar' : 'Calendario'}</CardTitle>
                <CardCaption>{monthLabel}</CardCaption>
              </div>

              <div className="flex flex-wrap gap-2">
                {monthOptions.map((candidateMonth) => (
                  <Link
                    key={candidateMonth}
                    href={{
                      pathname: '/events',
                      query: {
                        ...(cityFilter === 'all' ? {} : { city: cityFilter }),
                        month: candidateMonth,
                      },
                    }}
                    className={
                      candidateMonth === activeMonth
                        ? 'border border-accent bg-accent px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-accent-foreground'
                        : 'border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-muted transition-colors hover:border-accent hover:text-foreground'
                    }
                  >
                    {formatMonthChip(candidateMonth, locale)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center">
              {weekDays.map((label) => (
                <div
                  key={label}
                  className="py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted"
                >
                  {label}
                </div>
              ))}

              {calendarDays.map((entry) => {
                if (entry.dayNumber === 0) {
                  return (
                    <div
                      key={entry.dayKey}
                      className="min-h-20 border border-transparent"
                      aria-hidden
                    />
                  );
                }

                const hasEvents = entry.count > 0;
                const isSelected = entry.dayKey === selectedDay;

                const baseClasses = isSelected
                  ? 'border-accent bg-accent text-accent-foreground'
                  : hasEvents
                    ? 'border-border bg-surface text-foreground hover:border-accent'
                    : 'border-border/60 bg-background text-muted';

                return hasEvents ? (
                  <Link
                    key={entry.dayKey}
                    href={{
                      pathname: '/events',
                      query: {
                        ...(cityFilter === 'all' ? {} : { city: cityFilter }),
                        month: activeMonth,
                        day: entry.dayKey,
                      },
                    }}
                    className={`min-h-20 border p-2 text-left transition-colors ${baseClasses}`}
                  >
                    <div className="font-display text-lg font-black leading-none">
                      {entry.dayNumber}
                    </div>
                    <div className="mt-2 font-display text-[10px] font-bold uppercase tracking-[0.15em]">
                      {entry.count} {locale === 'en' ? 'events' : 'eventos'}
                    </div>
                  </Link>
                ) : (
                  <div
                    key={entry.dayKey}
                    className={`min-h-20 border p-2 text-left ${baseClasses}`}
                  >
                    <div className="font-display text-lg font-black leading-none opacity-70">
                      {entry.dayNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-display text-[clamp(1.3rem,2.5vw,1.8rem)] font-black uppercase tracking-tight">
                {locale === 'en' ? 'Selected day' : 'Dia seleccionado'}: {selectedDay}
              </h2>
              <p className="text-sm text-muted">
                {selectedEvents.length} {locale === 'en' ? 'events' : 'eventos'}
              </p>
            </div>

            {selectedEvents.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {selectedEvents.map((event) => (
                  <EventFlyerCard key={event.id} event={event} locale={locale} />
                ))}
              </div>
            ) : (
              <Card>
                <CardTitle>{locale === 'en' ? 'No events this day' : 'No hay eventos ese dia'}</CardTitle>
                <CardCaption>
                  {locale === 'en'
                    ? 'Select another highlighted calendar day.'
                    : 'Selecciona otro dia resaltado del calendario.'}
                </CardCaption>
              </Card>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-[clamp(1.3rem,2.5vw,1.8rem)] font-black uppercase tracking-tight">
              {locale === 'en' ? 'Month timeline' : 'Timeline mensual'}
            </h2>

            {monthDayEntries.length > 0 ? (
              <div className="space-y-5">
                {monthDayEntries.map(([dayKey, dayEvents]) => (
                  <div key={dayKey} className="space-y-2">
                    <h3 className="font-display text-sm font-black uppercase tracking-[0.15em] text-muted">
                      {dayKey} · {dayEvents.length} {locale === 'en' ? 'events' : 'eventos'}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {dayEvents.map((event) => (
                        <EventFlyerCard key={`${dayKey}-${event.id}`} event={event} locale={locale} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardTitle>{locale === 'en' ? 'No month events' : 'Sin eventos este mes'}</CardTitle>
              </Card>
            )}
          </section>
        </>
      ) : (
        <Card>
          <CardTitle>{locale === 'en' ? 'No events available' : 'No hay eventos disponibles'}</CardTitle>
          <CardCaption>
            {locale === 'en'
              ? 'Event ingestion returned no data right now. Try again later.'
              : 'La ingesta no devolvio datos por ahora. Intentalo mas tarde.'}
          </CardCaption>
        </Card>
      )}

      {unavailableCities.length > 0 ? (
        <Card>
          <CardTitle>{locale === 'en' ? 'Source warning' : 'Aviso de fuente'}</CardTitle>
          <CardCaption>
            {locale === 'en'
              ? `RA ingestion failed for: ${unavailableCities.map(cityLabel).join(', ')}.`
              : `La ingesta de RA fallo para: ${unavailableCities.map(cityLabel).join(', ')}.`}
          </CardCaption>
          <p className="mt-2 text-sm text-muted">
            {locale === 'en'
              ? 'The page retries automatically and will recover when source data is reachable.'
              : 'La pagina reintenta automaticamente y se recuperara cuando la fuente vuelva a estar accesible.'}
          </p>
          <p className="mt-2 text-xs text-muted">
            {locale === 'en' ? 'Last refresh:' : 'Ultima actualizacion:'}{' '}
            {new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }).format(new Date(generatedAtIso))}
          </p>
        </Card>
      ) : null}

    </div>
  );
}

function EventFlyerCard({ event, locale }: { event: RaEvent; locale: 'en' | 'es' }) {
  return (
    <article className="group relative overflow-hidden border border-border bg-surface">
      <div className="relative min-h-[260px]">
        {event.imageUrl ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
            style={{ backgroundImage: `url("${event.imageUrl}")` }}
          />
        ) : (
          <div className="absolute inset-0 bg-linear-to-br from-accent/35 via-accent-2/25 to-background" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/15" />

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
            {event.city === 'barcelona' ? 'Barcelona' : 'Madrid'}
          </p>
          <h3 className="mt-1 font-display text-lg font-black uppercase leading-tight tracking-tight text-white md:text-xl">
            {event.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/85 md:text-sm">
            <p>{event.venue}</p>
            <p>{formatEventDateLabel(event.startDateIso, locale)}</p>
          </div>
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex border border-white/30 bg-black/35 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-accent hover:text-accent"
          >
            {locale === 'en' ? 'Open in RA' : 'Abrir en RA'}
          </a>
        </div>
      </div>
    </article>
  );
}

function cityLabel(city: EventCityFilter): string {
  if (city === 'all') return 'All';
  if (city === 'barcelona') return 'Barcelona';
  return 'Madrid';
}

function groupByDay(events: RaEvent[]) {
  const byDay = new Map<string, RaEvent[]>();

  for (const event of events) {
    const dayKey = event.startDateIso.slice(0, 10);
    const list = byDay.get(dayKey);
    if (!list) {
      byDay.set(dayKey, [event]);
      continue;
    }
    list.push(event);
  }

  for (const [dayKey, dayEvents] of byDay.entries()) {
    byDay.set(
      dayKey,
      dayEvents.sort(
        (a, b) => new Date(a.startDateIso).getTime() - new Date(b.startDateIso).getTime(),
      ),
    );
  }

  return byDay;
}

function buildCalendarDays(activeMonth: string, byDay: Map<string, RaEvent[]>) {
  const monthDate = toDateAtUtc(activeMonth);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  const firstWeekday = toMondayFirst(monthDate.getUTCDay());
  const cells: Array<{ dayKey: string; dayNumber: number; count: number }> = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({
      dayKey: `${activeMonth}-pad-${i}`,
      dayNumber: 0,
      count: 0,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayKey = `${activeMonth}-${String(day).padStart(2, '0')}`;
    cells.push({
      dayKey,
      dayNumber: day,
      count: byDay.get(dayKey)?.length ?? 0,
    });
  }

  return cells;
}

function toDateAtUtc(yyyyMm: string): Date {
  return new Date(`${yyyyMm}-01T00:00:00.000Z`);
}

function firstDayOfMonth(yyyyMm: string): string {
  return `${yyyyMm}-01`;
}

function lastDayOfMonth(yyyyMm: string): string {
  const monthDate = toDateAtUtc(yyyyMm);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  return new Date(Date.UTC(year, month + 1, 0)).toISOString().slice(0, 10);
}

function buildMonthOptions(yyyyMm: string, prev: number, next: number): string[] {
  const source = toDateAtUtc(yyyyMm);
  const year = source.getUTCFullYear();
  const month = source.getUTCMonth();
  const options: string[] = [];

  for (let delta = -prev; delta <= next; delta += 1) {
    const candidate = new Date(Date.UTC(year, month + delta, 1));
    options.push(candidate.toISOString().slice(0, 7));
  }

  return options;
}

function formatMonthChip(yyyyMm: string, locale: 'en' | 'es'): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    month: 'short',
    year: '2-digit',
  }).format(toDateAtUtc(yyyyMm));
}

function toMondayFirst(sundayFirst: number): number {
  return sundayFirst === 0 ? 6 : sundayFirst - 1;
}

function weekdayLabels(locale: 'en' | 'es') {
  return locale === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
}
