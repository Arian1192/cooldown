import Link from 'next/link';
import { notFound } from 'next/navigation';

import { SoundCloudEmbed } from '@/components/embeds/SoundCloudEmbed';
import { SpotifyEmbed } from '@/components/embeds/SpotifyEmbed';
import { TrackEventOnRender } from '@/components/TrackEventOnRender';
import { YouTubeEmbed } from '@/components/embeds/YouTubeEmbed';
import { cn } from '@/lib/cn';
import type { ContentItem, SetMoment } from '@/lib/content';
import {
  getDiscoverWeeklyNeighbors,
  getItem,
  labelForCity,
} from '@/lib/content';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n';
import { siteUrl } from '@/lib/site';
import { articleJsonLd } from '@/lib/structuredData';

// ── Helpers ────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 font-display text-xs font-bold uppercase tracking-[0.28em] text-accent">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-border" />;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.75" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={14}
          height={14}
          viewBox="0 0 14 14"
          className={i < rating ? 'text-accent' : 'text-border'}
          aria-hidden="true"
        >
          <rect width={14} height={14} fill="currentColor" />
        </svg>
      ))}
      <span className="ml-2 font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
        {rating}/5
      </span>
    </div>
  );
}

function EnergyFlames({ level, locale }: { level: number; locale: Locale }) {
  return (
    <span
      className="font-display text-sm tracking-wider"
      aria-label={
        locale === 'en'
          ? `Energy level ${level} out of 5`
          : `Nivel de energia ${level} de 5`
      }
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < level ? 'opacity-100' : 'opacity-20'}>
          🔥
        </span>
      ))}
    </span>
  );
}

function EmbedPlayer({ url, title }: { url: string; title: string }) {
  if (url.includes('spotify.com')) {
    return (
      <SpotifyEmbed
        url={url}
        title={title}
        variant="regular"
        className="border-0"
      />
    );
  }
  if (url.includes('soundcloud.com')) {
    return <SoundCloudEmbed url={url} title={title} className="border-0" />;
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return <YouTubeEmbed url={url} title={title} className="border-0" />;
  }
  return null;
}

// ── Tag chip ───────────────────────────────────────────────────────────────────

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center border border-border bg-background px-2 py-0.5 font-display text-xs uppercase tracking-[0.18em] text-muted">
      #{children}
    </span>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export async function WeeklyDiscoverDetail({
  slug,
  item: itemProp,
  previous: previousProp,
  next: nextProp,
  locale = DEFAULT_LOCALE,
}: {
  slug?: string;
  item?: ContentItem;
  previous?: ContentItem | null;
  next?: ContentItem | null;
  locale?: Locale;
}) {
  const item = itemProp ?? (slug ? await getItem('discover', slug, locale) : null);
  if (!item || item.episode == null) notFound();

  const fallbackNeighbors = await getDiscoverWeeklyNeighbors(item.slug, locale);
  const previous = previousProp ?? fallbackNeighbors.previous;
  const next = nextProp ?? fallbackNeighbors.next;

  const jsonLd = articleJsonLd(item, locale);
  const canonical = siteUrl(`/discover/${item.slug}`);
  const copy = {
    weekly: 'Weekly Discover',
    idCard: 'ID Card',
    review: 'Rating',
    technical: 'Technical Bite',
    mood: 'Mood Scenario',
    prediction: 'Track Prediction',
    energy: 'Energy Level',
    setMoment: 'Set Moment',
    permalink: 'Permalink',
    nav: 'Weekly navigation',
  };
  const setMomentLabel: Record<SetMoment, string> = {
    'warm-up': 'Warm-up',
    'peak-time': 'Peak Time',
    closing: 'Closing',
    'after-hours': 'After Hours',
  };

  return (
    <article className="mx-auto max-w-3xl space-y-0">
      <TrackEventOnRender
        name="detail_viewed"
        payload={{ type: item.type, slug: item.slug, city: item.city }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Episode header ─────────────────────────────────────────────── */}
      <header className="space-y-3 pb-8">
        <div className="flex items-center gap-3">
          <span className="font-display text-xs font-bold uppercase tracking-[0.28em] text-accent">
            {copy.weekly} · #{String(item.episode).padStart(2, '0')}
          </span>
          <span className="h-px flex-1 bg-border" />
          <span className="font-display text-xs uppercase tracking-[0.2em] text-muted">
            {labelForCity(item.city)} · {item.date}
          </span>
        </div>

        <h1 className="font-display text-[clamp(2rem,5vw,3.8rem)] font-black uppercase leading-none tracking-[-0.03em]">
          {item.trackArtist}
          <span className="block text-muted">
            {item.title.replace(`${item.trackArtist} – `, '')}
          </span>
        </h1>

        <div className="flex flex-wrap gap-2 pt-1">
          {item.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </div>
      </header>

      {/* ── Embedded player ────────────────────────────────────────────── */}
      {item.embedUrl && (
        <>
          <Divider />
          <section className="py-6">
            <div className="w-full">
              <EmbedPlayer url={item.embedUrl} title={item.title} />
            </div>
          </section>
        </>
      )}

      {/* ── 🗂️ ID Card ────────────────────────────────────────────────── */}
      <Divider />
      <section className="py-8">
        <SectionLabel>🗂️ {copy.idCard}</SectionLabel>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
            {[
            { term: 'Artist', def: item.trackArtist },
            { term: 'Label', def: item.trackLabel },
            { term: 'Release', def: item.trackReleaseDate },
            { term: 'BPM', def: item.bpm?.toString() },
            { term: 'Key', def: item.musicalKey },
            { term: 'City', def: labelForCity(item.city) },
          ].map(({ term, def }) =>
            def ? (
              <div key={term}>
                <dt className="font-display text-xs uppercase tracking-[0.2em] text-muted">
                  {term}
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold uppercase tracking-[0.04em] text-foreground">
                  {def}
                </dd>
              </div>
            ) : null,
          )}
        </dl>
      </section>

      {/* ── ⭐ Rating ─────────────────────────────────────────────────── */}
      {item.rating != null && item.verdict && (
        <>
          <Divider />
          <section className="py-8">
            <SectionLabel>⭐ {copy.review}</SectionLabel>
            <div className="flex items-start gap-6">
              {/* Large episode number — decorative */}
              <span
                className="hidden font-display text-[4rem] font-black leading-none tracking-[-0.06em] text-border sm:block"
                aria-hidden="true"
              >
                #{String(item.episode).padStart(2, '0')}
              </span>
              <div className="space-y-3">
                <StarRow rating={item.rating} />
                <p className="max-w-prose text-base leading-relaxed text-muted">
                  {item.verdict}
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── 🔊 Technical Bite ─────────────────────────────────────────── */}
      {item.technicalBite && (
        <>
          <Divider />
          <section className="py-8">
            <SectionLabel>
              🔊 {copy.technical}
            </SectionLabel>
            <p className="max-w-prose text-base leading-relaxed text-foreground/80">
              {item.technicalBite}
            </p>
          </section>
        </>
      )}

      {/* ── 🪐 Mood Scenario ──────────────────────────────────────────── */}
      {item.moodScenario && (
        <>
          <Divider />
          <section className="py-8">
            <SectionLabel>🪐 {copy.mood}</SectionLabel>
            <p className="max-w-prose text-base italic leading-relaxed text-muted">
              &ldquo;{item.moodScenario}&rdquo;
            </p>
          </section>
        </>
      )}

      {/* ── ⚡ Track Prediction ───────────────────────────────────────── */}
      {(item.energyLevel != null || item.setMoment) && (
        <>
          <Divider />
          <section className="py-8">
            <SectionLabel>⚡ {copy.prediction}</SectionLabel>
            <div className="flex flex-wrap items-center gap-6">
              {item.energyLevel != null && (
                <div className="space-y-1">
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
                    {copy.energy}
                  </p>
                  <EnergyFlames level={item.energyLevel} locale={locale} />
                </div>
              )}
              {item.setMoment && (
                <div className="space-y-1">
                  <p className="font-display text-xs uppercase tracking-[0.2em] text-muted">
                    {copy.setMoment}
                  </p>
                  <span
                    className={cn(
                      'inline-flex items-center border border-border bg-surface px-3 py-1',
                      'font-display text-xs font-bold uppercase tracking-[0.18em] text-foreground',
                    )}
                  >
                    {setMomentLabel[item.setMoment]}
                  </span>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* ── Permalink ─────────────────────────────────────────────────── */}
      <Divider />
      <div className="py-4 text-sm text-muted">
        {copy.permalink}:{' '}
        <a
          className="underline"
          href={canonical}
          target="_blank"
          rel="noreferrer"
        >
          {canonical}
        </a>
      </div>

      <Divider />
      <nav
        aria-label={copy.nav}
        className="flex items-center justify-between gap-4 py-6"
      >
        <div className="flex-1">
          {previous ? (
            <Link
              href={`/discover/${previous.slug}`}
              className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40"
              title={`${previous.trackArtist ?? ''} ${previous.title}`.trim()}
            >
              <span aria-hidden="true">←</span>
              <span className="max-w-[28ch] truncate">
                {previous.trackArtist ?? previous.title}
                {previous.trackArtist ? ' — ' : ''}
                {previous.trackArtist
                  ? previous.title.replace(`${previous.trackArtist} – `, '')
                  : ''}
              </span>
            </Link>
          ) : null}
        </div>

        <div className="flex flex-1 justify-end">
          {next ? (
            <Link
              href={`/discover/${next.slug}`}
              className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-accent/40"
              title={`${next.trackArtist ?? ''} ${next.title}`.trim()}
            >
              <span className="max-w-[28ch] truncate">
                {next.trackArtist ?? next.title}
                {next.trackArtist ? ' — ' : ''}
                {next.trackArtist
                  ? next.title.replace(`${next.trackArtist} – `, '')
                  : ''}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </nav>
    </article>
  );
}
