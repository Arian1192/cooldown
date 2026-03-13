import type { Metadata } from 'next';
import Link from 'next/link';

import { PageHeader } from '@/components/ui/PageHeader';
import { listEventRequests } from '@/lib/events/store';
import { basicOg } from '@/lib/seo';

export const metadata: Metadata = basicOg({
  title: 'Events Moderation',
  description: 'Backoffice para revisar solicitudes de eventos de partners.',
  canonicalPath: '/events/moderation',
});

function statusClass(status: 'pending_review' | 'approved' | 'rejected') {
  if (status === 'approved') return 'border-lime-400/50 bg-lime-400/10 text-lime-100';
  if (status === 'rejected') return 'border-red-400/50 bg-red-400/10 text-red-100';
  return 'border-amber-400/50 bg-amber-400/10 text-amber-100';
}

export default function EventsModerationPage() {
  const requests = listEventRequests().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Moderation Queue"
        caption="Tablero interno de solicitudes partner. Este listado confirma que las solicitudes publicas quedaron registradas para revision."
      />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/events/submit"
          className="inline-flex items-center border border-border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
        >
          New Partner Submission
        </Link>
        <Link
          href="/events"
          className="inline-flex items-center border border-border px-4 py-2 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
        >
          Back to Events
        </Link>
      </div>

      {requests.length ? (
        <section className="grid gap-3 sm:grid-cols-2">
          {requests.map((request) => (
            <article key={request.id} className="border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
                  {request.partnerName}
                </p>
                <span
                  className={`inline-flex items-center border px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] ${statusClass(
                    request.status,
                  )}`}
                >
                  {request.status}
                </span>
              </div>

              <h2 className="mt-2 font-display text-[1.2rem] font-black uppercase leading-tight">{request.title}</h2>
              <p className="mt-1 text-sm text-muted">
                {request.city} · {request.venue}
              </p>

              <dl className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-foreground">Date</dt>
                  <dd className="mt-1">{new Date(request.date).toLocaleString('en-GB')}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-foreground">Type</dt>
                  <dd className="mt-1">{request.eventType}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-foreground">Genres</dt>
                  <dd className="mt-1">{request.genres.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-foreground">Lineup</dt>
                  <dd className="mt-1">{request.lineUp.join(', ')}</dd>
                </div>
              </dl>

              <div className="mt-3 flex flex-wrap gap-2">
                {request.logoAssetUrl ? (
                  <a
                    href={request.logoAssetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center border border-border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-accent hover:text-accent"
                  >
                    Logo Asset
                  </a>
                ) : null}
                {request.artworkAssetUrl ? (
                  <a
                    href={request.artworkAssetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center border border-border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-accent hover:text-accent"
                  >
                    Artwork Asset
                  </a>
                ) : null}
                {request.sourceRaUrl ? (
                  <a
                    href={request.sourceRaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center border border-border px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.16em] transition-colors hover:border-accent hover:text-accent"
                  >
                    Resident Advisor
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="border border-border bg-surface p-6 text-center">
          <h2 className="font-display text-xl font-black uppercase">No requests yet</h2>
          <p className="mt-2 text-sm text-muted">Partner submissions will appear here once created.</p>
        </section>
      )}
    </div>
  );
}
