'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { formatEventDateLabel, type RaEvent } from '@/lib/raEvents';

type Props = {
  events: RaEvent[];
  locale: 'en' | 'es';
};

type ActiveDialog = {
  event: RaEvent;
  trigger: HTMLButtonElement | null;
};

export function EventFlyerGallery({ events, locale }: Props) {
  const [activeDialog, setActiveDialog] = useState<ActiveDialog | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!activeDialog) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActiveDialog((current) => {
          current?.trigger?.focus();
          return null;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeDialog]);

  const openDialog = (event: RaEvent, trigger: HTMLButtonElement | null) => {
    setActiveDialog({ event, trigger });
  };

  const closeDialog = () => {
    setActiveDialog((current) => {
      current?.trigger?.focus();
      return null;
    });
  };

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {events.map((event) => (
          <article key={event.id} className="group relative overflow-hidden border border-border bg-surface">
            <button
              type="button"
              onClick={(clickEvent) => {
                openDialog(event, clickEvent.currentTarget);
              }}
              className="absolute inset-0 z-10 cursor-zoom-in"
              aria-label={
                locale === 'en'
                  ? `Open flyer for ${event.title}`
                  : `Abrir flyer de ${event.title}`
              }
            />

            <div className="relative min-h-[260px]">
              {event.imageUrl ? (
                <>
                  {!loadedImages[event.id] ? (
                    <div className="absolute inset-0 animate-pulse bg-linear-to-br from-surface via-background to-surface" />
                  ) : null}
                  <Image
                    src={event.imageUrl}
                    alt=""
                    fill
                    unoptimized
                    loading="lazy"
                    sizes="(min-width: 1536px) 22vw, (min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className={`absolute inset-0 object-cover bg-center transition-all duration-500 group-hover:scale-[1.03] ${
                      loadedImages[event.id] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => {
                      setLoadedImages((current) => ({ ...current, [event.id]: true }));
                    }}
                  />
                </>
              ) : (
                <div className="absolute inset-0 bg-linear-to-br from-accent/35 via-accent-2/25 to-background" />
              )}

              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/45 to-black/15" />

              <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
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
                  className="relative z-30 mt-3 inline-flex border border-white/30 bg-black/35 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:border-accent hover:text-accent"
                >
                  {locale === 'en' ? 'Open in RA' : 'Abrir en RA'}
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {activeDialog ? (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-flyer-title"
            className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden border border-border bg-surface"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeDialog}
              className="absolute right-3 top-3 z-20 border border-white/35 bg-black/60 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-accent hover:text-accent"
            >
              {locale === 'en' ? 'Close' : 'Cerrar'}
            </button>

            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="relative flex max-h-[70vh] items-center justify-center bg-black">
                {activeDialog.event.imageUrl ? (
                  <Image
                    src={activeDialog.event.imageUrl}
                    alt={activeDialog.event.title}
                    width={1400}
                    height={1800}
                    unoptimized
                    className="max-h-[70vh] w-auto max-w-full object-contain"
                  />
                ) : (
                  <div className="flex h-[320px] w-full items-center justify-center bg-linear-to-br from-accent/30 via-accent-2/20 to-background px-6 text-center font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
                    {locale === 'en' ? 'Flyer unavailable' : 'Flyer no disponible'}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-border p-5 lg:border-l lg:border-t-0">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                  {activeDialog.event.city === 'barcelona' ? 'Barcelona' : 'Madrid'}
                </p>
                <h3
                  id="event-flyer-title"
                  className="font-display text-xl font-black uppercase leading-tight tracking-tight"
                >
                  {activeDialog.event.title}
                </h3>
                <p className="text-sm text-muted">{activeDialog.event.venue}</p>
                <p className="text-sm text-muted">
                  {formatEventDateLabel(activeDialog.event.startDateIso, locale)}
                </p>
                <a
                  href={activeDialog.event.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex border border-border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-accent hover:text-accent"
                >
                  {locale === 'en' ? 'Open in RA' : 'Abrir en RA'}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
