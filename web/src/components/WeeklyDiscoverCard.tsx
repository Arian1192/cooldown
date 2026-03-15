'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { SoundCloudEmbed } from '@/components/embeds/SoundCloudEmbed';
import { SpotifyEmbed } from '@/components/embeds/SpotifyEmbed';
import { YouTubeEmbed } from '@/components/embeds/YouTubeEmbed';
import {
  CardCaption,
  CardChip,
  CardInteractive,
  CardTitle,
} from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { ContentItem } from '@/lib/content';
import { type Locale } from '@/lib/i18n';

const DISCOVER_PREVIEW_EVENT = 'discover-preview-activate';
const COVER_PLACEHOLDER_SRC = '/placeholders/urban-cover.svg';

// ── Small helpers ──────────────────────────────────────────────────────────────

function EnergySquares({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.75">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block h-1.5 w-1.5',
            i < level ? 'bg-accent' : 'bg-border',
          )}
        />
      ))}
    </div>
  );
}

function EmbedPreview({ url, title }: { url: string; title: string }) {
  if (url.includes('spotify.com')) {
    return <SpotifyEmbed url={url} title={title} variant="compact" className="border-0" />;
  }
  if (url.includes('soundcloud.com')) {
    return <SoundCloudEmbed url={url} title={title} className="border-0" />;
  }
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return <YouTubeEmbed url={url} title={title} className="border-0" />;
  }
  return null;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function WeeklyDiscoverCard({
  item,
  locale,
}: {
  item: ContentItem;
  locale: Locale;
}) {
  const [embedReady, setEmbedReady] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    const onPreviewActivate = (event: Event) => {
      const customEvent = event as CustomEvent<{ slug?: string }>;
      if (customEvent.detail?.slug !== item.slug) {
        setEmbedReady(false);
      }
    };

    window.addEventListener(DISCOVER_PREVIEW_EVENT, onPreviewActivate);
    return () => {
      window.removeEventListener(DISCOVER_PREVIEW_EVENT, onPreviewActivate);
    };
  }, [item.slug]);

  const activatePreview = () => {
    window.dispatchEvent(
      new CustomEvent(DISCOVER_PREVIEW_EVENT, { detail: { slug: item.slug } }),
    );
    setEmbedReady(true);
  };

  const SET_MOMENT_LABEL: Record<string, string> = {
    'warm-up': 'Warm-up',
    'peak-time': 'Peak Time',
    closing: 'Closing',
    'after-hours': 'After Hours',
  };

  return (
    <CardInteractive
      className="group overflow-hidden p-0"
      onMouseEnter={activatePreview}
      onMouseLeave={() => setEmbedReady(false)}
    >
      {/* ── Image + overlay ─────────────────────────────────────────────── */}
      <div className="relative aspect-16/10 overflow-hidden bg-foreground/5">
        <Image
          src={coverFailed ? COVER_PLACEHOLDER_SRC : item.coverImageSrc}
          alt={item.coverImageAlt}
          width={1200}
          height={750}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          onError={() => {
            if (!coverFailed) {
              setCoverFailed(true);
            }
          }}
        />

        {/* Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

        {/* Episode chip */}
        <div className="absolute left-0 top-0">
          <CardChip>Weekly #{item.episode}</CardChip>
        </div>

        {/* BPM / Key / Set Moment bar — bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/80">
            {item.bpm} BPM · {item.musicalKey}
          </span>
          {item.setMoment && (
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">
              {SET_MOMENT_LABEL[item.setMoment]}
            </span>
          )}
        </div>

        {/* Hover embed overlay — mounts iframe only once user hovers */}
        <div
          className={cn(
            'absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/95 px-3',
            'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
          )}
        >
          {/* Episode + artist label */}
          <p className="w-full font-display text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
            Weekly #{item.episode} · {item.trackArtist}
          </p>
          {embedReady && item.embedUrl ? (
            <div className="w-full">
              <EmbedPreview url={item.embedUrl} title={item.title} />
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Card body ───────────────────────────────────────────────────── */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="min-w-0">
            <Link
              href={`/discover/${item.slug}`}
              className="outline-none hover:underline focus-visible:underline"
            >
              {item.trackArtist}
              <span className="block font-display text-[13px] font-normal text-muted">
                {/* Strip artist from title for display */}
                {item.title.replace(`${item.trackArtist} – `, '')}
              </span>
            </Link>
          </CardTitle>
          {item.energyLevel != null && (
            <div className="shrink-0 pt-1">
              <EnergySquares level={item.energyLevel} />
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3">
          {item.rating != null && <StarRating rating={item.rating} locale={locale} />}
          <CardCaption>
            {item.trackLabel} · {item.trackReleaseDate}
          </CardCaption>
        </div>

        {item.verdict && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{item.verdict}</p>
        )}
      </div>
    </CardInteractive>
  );
}

function StarRating({ rating, locale }: { rating: number; locale: Locale }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} ${locale === 'en' ? 'out of 5' : 'de 5'}`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={9}
          height={9}
          viewBox="0 0 9 9"
          className={i < rating ? 'text-accent' : 'text-border'}
          aria-hidden="true"
        >
          <rect width={9} height={9} fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
