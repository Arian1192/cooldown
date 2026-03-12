import type { Metadata } from 'next';
import Link from 'next/link';

import { EventFlyerGallery } from '@/components/events/EventFlyerGallery';
import { Card, CardCaption, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { getRequestLocale } from '@/lib/requestLocale';
import {
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
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const weekendDay = nextWeekendStart(today);
  const discoveryStart = firstDayOfMonth(currentMonth);
  const requestedMonth = MONTH_FORMAT.test(month ?? '') ? (month as string) : undefined;
  const requestedDay = DAY_FORMAT.test(day ?? '') ? (day as string) : undefined;
  const horizonEnd = addDays(today, 120);

  const { events, unavailableCities, generatedAtIso } =
    await getResidentAdvisorEvents({
      city: cityFilter,
      limit: 500,
      fromDate: discoveryStart,
      toDate: horizonEnd,
    });

  const availableMonths = [...new Set(events.map((event) => event.startDateIso.slice(0, 7)))].sort();
  const requestedMonthFromDay = requestedDay?.slice(0, 7);
  const activeMonthCandidate = requestedMonthFromDay ?? requestedMonth ?? availableMonths[0] ?? currentMonth;
  const activeMonth = availableMonths.includes(activeMonthCandidate)
    ? activeMonthCandidate
    : availableMonths[0] ?? currentMonth;
  const monthDate = toDateAtUtc(activeMonth);
  const monthStart = firstDayOfMonth(activeMonth);
  const monthEnd = lastDayOfMonth(activeMonth);
  const rangeStart = activeMonth === currentMonth ? today : monthStart;

  const monthEventsFromRange = events.filter((event) => {
    const dayKey = event.startDateIso.slice(0, 10);
    return dayKey >= monthStart && dayKey <= monthEnd && dayKey >= rangeStart;
  });
  const monthEvents =
    monthEventsFromRange.length > 0
      ? monthEventsFromRange
      : events.filter((event) => {
          const dayKey = event.startDateIso.slice(0, 10);
          return dayKey >= monthStart && dayKey <= monthEnd;
        });

  const byDay = groupByDay(monthEvents);
  const calendarDays = buildCalendarDays(activeMonth, byDay);
  const defaultDay =
    calendarDays.find((entry) => entry.count > 0)?.dayKey ??
    rangeStart;

  const selectedDay =
    requestedDay && requestedDay.startsWith(activeMonth) && requestedDay >= rangeStart
      ? requestedDay
      : defaultDay;

  const selectedEvents = byDay.get(selectedDay) ?? [];
  const monthDayEntries = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b));

  const monthLabel = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(monthDate);
  const monthOptions = availableMonths.length > 0 ? availableMonths : [activeMonth];

  const caption =
    locale === 'en'
      ? `Barcelona + Madrid · ${monthLabel}`
      : `Barcelona + Madrid · ${monthLabel}`;

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

      <Card className="space-y-6 p-5 sm:p-6">
        <div>
          <CardTitle>{locale === 'en' ? 'Filters' : 'Filtros'}</CardTitle>
          <CardCaption className="text-xs normal-case tracking-[0.05em]">
            {locale === 'en'
              ? 'City and quick discovery filters in one control block.'
              : 'Ciudad y filtros rapidos de descubrimiento en un solo bloque de control.'}
          </CardCaption>
        </div>

        <div className="space-y-3">
          <p className="font-display text-[11px] font-black uppercase tracking-[0.18em] text-muted">
            {locale === 'en' ? 'City' : 'Ciudad'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
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
                    ? 'shrink-0 whitespace-nowrap border border-accent bg-accent px-5 py-2.5 text-center font-display text-[12px] font-black uppercase tracking-[0.1em] text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    : 'shrink-0 whitespace-nowrap border border-border px-5 py-2.5 text-center font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                }
              >
                {cityLabel(filter, locale)}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-display text-[11px] font-black uppercase tracking-[0.18em] text-muted">
            {locale === 'en' ? 'Quick filters' : 'Filtros rapidos'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href={{
                pathname: '/events',
                query: {
                  ...(cityFilter === 'all' ? {} : { city: cityFilter }),
                  month: today.slice(0, 7),
                  day: today,
                },
              }}
              className={
                selectedDay === today
                  ? 'border border-accent bg-accent px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  : 'border border-border px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              }
            >
              {locale === 'en' ? 'Today' : 'Hoy'}
            </Link>

            <Link
              href={{
                pathname: '/events',
                query: {
                  ...(cityFilter === 'all' ? {} : { city: cityFilter }),
                  month: weekendDay.slice(0, 7),
                  day: weekendDay,
                },
              }}
              className={
                selectedDay === weekendDay
                  ? 'border border-accent bg-accent px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  : 'border border-border px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              }
            >
              {locale === 'en' ? 'Weekend' : 'Fin de semana'}
            </Link>

            <Link
              href={{
                pathname: '/events',
                query: {
                  ...(cityFilter === 'all' ? {} : { city: cityFilter }),
                  month: currentMonth,
                },
              }}
              className={
                activeMonth === currentMonth
                  ? 'border border-accent bg-accent px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                  : 'border border-border px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
              }
            >
              {locale === 'en' ? 'This month' : 'Este mes'}
            </Link>
          </div>
        </div>
      </Card>

      {monthEvents.length > 0 ? (
        <>
          <Card className="space-y-5 p-5 sm:p-6">
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
                        ? 'border border-accent bg-accent px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                        : 'border border-border px-4 py-2.5 font-display text-[12px] font-bold uppercase tracking-[0.1em] text-muted transition-colors hover:border-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                    }
                  >
                    {formatMonthChip(candidateMonth, locale)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2.5 text-center">
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
                    className={`min-h-24 border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${baseClasses}`}
                  >
                    <div className="font-display text-lg font-black leading-none">
                      {entry.dayNumber}
                    </div>
                    <div className="mt-2 font-display text-[12px] font-bold uppercase tracking-[0.14em]">
                      {entry.count} {locale === 'en' ? 'events' : 'eventos'}
                    </div>
                  </Link>
                ) : (
                  <div
                    key={entry.dayKey}
                    className={`min-h-24 border p-3 text-left ${baseClasses}`}
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
                {locale === 'en' ? 'Selected day' : 'Dia seleccionado'}:{' '}
                {formatDayKeyForHeading(selectedDay, locale)}
              </h2>
              <p className="text-sm text-muted">
                {selectedEvents.length} {locale === 'en' ? 'events' : 'eventos'}
              </p>
            </div>

            {selectedEvents.length > 0 ? (
              <EventFlyerGallery events={selectedEvents} locale={locale} />
            ) : (
              <Card className="p-5 sm:p-6">
                <CardTitle>{locale === 'en' ? 'No events this day' : 'No hay eventos ese dia'}</CardTitle>
                <CardCaption>
                  {locale === 'en'
                    ? 'Select another highlighted calendar day.'
                    : 'Selecciona otro dia resaltado del calendario.'}
                </CardCaption>
              </Card>
            )}
          </section>

          {monthDayEntries.length > 0 ? (
            <section className="space-y-3">
              <details className="border border-border bg-surface">
                <summary className="cursor-pointer list-none px-4 py-3">
                  <span className="font-display text-sm font-black uppercase tracking-[0.15em]">
                    {locale === 'en'
                      ? `Open full month timeline (${monthDayEntries.length} days)`
                      : `Abrir timeline completo del mes (${monthDayEntries.length} dias)`}
                  </span>
                </summary>
                <div className="space-y-5 border-t border-border p-4">
                  {monthDayEntries.map(([dayKey, dayEvents]) => (
                    <div key={dayKey} className="space-y-2">
                      <h3 className="font-display text-sm font-black uppercase tracking-[0.15em] text-muted">
                        {dayKey} · {dayEvents.length} {locale === 'en' ? 'events' : 'eventos'}
                      </h3>
                      <EventFlyerGallery events={dayEvents} locale={locale} />
                    </div>
                  ))}
                </div>
              </details>
            </section>
          ) : null}
        </>
      ) : (
        <Card className="p-5 sm:p-6">
          <CardTitle>{locale === 'en' ? 'No events available' : 'No hay eventos disponibles'}</CardTitle>
          <CardCaption>
            {locale === 'en'
              ? 'Event ingestion returned no data right now. Try again later.'
              : 'La ingesta no devolvio datos por ahora. Intentalo mas tarde.'}
          </CardCaption>
        </Card>
      )}

      {unavailableCities.length > 0 ? (
        <Card className="p-5 sm:p-6">
          <CardTitle>{locale === 'en' ? 'Source warning' : 'Aviso de fuente'}</CardTitle>
          <CardCaption>
            {locale === 'en'
              ? `RA ingestion failed for: ${unavailableCities.map((city) => cityLabel(city, locale)).join(', ')}.`
              : `La ingesta de RA fallo para: ${unavailableCities.map((city) => cityLabel(city, locale)).join(', ')}.`}
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

function cityLabel(city: EventCityFilter, locale: 'en' | 'es'): string {
  if (city === 'all') return locale === 'en' ? 'All' : 'Todas';
  if (city === 'barcelona') return 'Barcelona';
  return 'Madrid';
}

function formatDayKeyForHeading(dayKey: string, locale: 'en' | 'es') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dayKey}T00:00:00.000Z`));
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

function formatMonthChip(yyyyMm: string, locale: 'en' | 'es'): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-ES', {
    month: 'short',
    year: '2-digit',
  }).format(toDateAtUtc(yyyyMm));
}

function addDays(yyyyMmDd: string, days: number): string {
  const date = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function nextWeekendStart(yyyyMmDd: string): string {
  const date = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  const day = date.getUTCDay();
  const daysToSaturday = (6 - day + 7) % 7;
  date.setUTCDate(date.getUTCDate() + daysToSaturday);
  return date.toISOString().slice(0, 10);
}

function toMondayFirst(sundayFirst: number): number {
  return sundayFirst === 0 ? 6 : sundayFirst - 1;
}

function weekdayLabels(locale: 'en' | 'es') {
  return locale === 'en'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
}
