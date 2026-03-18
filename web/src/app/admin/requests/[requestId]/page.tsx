import Link from 'next/link';
import { notFound } from 'next/navigation';

import { findEventRequestById } from '@/lib/events/store';

import { ModerationActions } from '../ModerationActions';

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: 'text-yellow-300 border-yellow-400/40 bg-yellow-400/10',
  approved: 'text-green-300 border-green-400/40 bg-green-400/10',
  rejected: 'text-red-300 border-red-400/40 bg-red-400/10',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  club_night: 'Club Night',
  showcase: 'Showcase',
  pop_up: 'Pop-Up',
  workshop: 'Workshop',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-1">
        {label}
      </dt>
      <dd className="text-sm text-[hsl(var(--foreground))]">{value ?? '—'}</dd>
    </div>
  );
}

interface PageProps {
  params: Promise<{ requestId: string }>;
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { requestId } = await params;
  const req = findEventRequestById(requestId);

  if (!req) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <Link
          href="/admin/requests"
          className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:text-[hsl(var(--foreground))]"
        >
          ← Volver a solicitudes
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.2em] ${STATUS_COLORS[req.status] ?? ''}`}
            >
              {STATUS_LABELS[req.status] ?? req.status}
            </span>
            <span className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
              {EVENT_TYPE_LABELS[req.eventType] ?? req.eventType}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.4rem,3vw,2rem)] font-bold uppercase tracking-[-0.02em]">
            {req.title}
          </h1>
        </div>
      </div>

      <div className="space-y-5">
        {/* Organizer */}
        <section
          className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <h2 className="font-[family-name:var(--font-barlow)] text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--accent))] mb-4">
            Organizador
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4">
            <Field label="Partner" value={req.partnerName} />
            <Field label="Partner ID" value={req.partnerId} />
          </dl>
        </section>

        {/* Event details */}
        <section
          className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <h2 className="font-[family-name:var(--font-barlow)] text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--accent))] mb-4">
            Detalles del evento
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4">
            <Field label="Título" value={req.title} />
            <Field label="Tipo" value={EVENT_TYPE_LABELS[req.eventType] ?? req.eventType} />
            <Field label="Fecha" value={formatDate(req.date)} />
            <Field label="Ciudad" value={req.city} />
            <Field label="Venue" value={req.venue} />
            {req.priceEur !== undefined && (
              <Field label="Precio" value={`${req.priceEur} €`} />
            )}
          </dl>

          {req.description && (
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))]">
              <dt className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-1">
                Descripción
              </dt>
              <p className="text-sm text-[hsl(var(--foreground)/0.9)] whitespace-pre-line">{req.description}</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] grid sm:grid-cols-2 gap-4">
            <div>
              <dt className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-1">
                Géneros
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {req.genres.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center border border-[hsl(var(--border))] px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]"
                  >
                    {g}
                  </span>
                ))}
              </dd>
            </div>
            <div>
              <dt className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-1">
                Lineup
              </dt>
              <dd className="flex flex-wrap gap-1.5">
                {req.lineUp.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center border border-[hsl(var(--border))] px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.18em] text-[hsl(var(--foreground))]"
                  >
                    {a}
                  </span>
                ))}
              </dd>
            </div>
          </div>

          {(req.ticketUrl || req.sourceRaUrl) && (
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] flex flex-wrap gap-4">
              {req.ticketUrl && (
                <a
                  href={req.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--accent))] hover:opacity-80 transition-opacity"
                >
                  Ver entradas ↗
                </a>
              )}
              {req.sourceRaUrl && (
                <a
                  href={req.sourceRaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Ver en RA ↗
                </a>
              )}
            </div>
          )}
        </section>

        {/* Moderation */}
        <section
          className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5"
          style={{ borderRadius: 'var(--radius)' }}
        >
          <h2 className="font-[family-name:var(--font-barlow)] text-[11px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--accent))] mb-4">
            Moderación
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4 mb-4">
            <Field label="Recibida" value={formatDate(req.createdAt)} />
            <Field label="Última actualización" value={formatDate(req.updatedAt)} />
            <Field label="Estado" value={STATUS_LABELS[req.status] ?? req.status} />
            {req.linkedEventId && (
              <div>
                <dt className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-1">
                  Evento publicado
                </dt>
                <dd>
                  <Link
                    href="/admin/events"
                    className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-green-300 hover:opacity-80 transition-opacity"
                  >
                    Ver evento →
                  </Link>
                </dd>
              </div>
            )}
          </dl>

          {req.moderationNotes && (
            <div className="mb-4 border border-[hsl(var(--border))] p-4">
              <p className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))] mb-1">
                Nota de moderación
              </p>
              <p className="text-sm text-[hsl(var(--foreground)/0.9)]">{req.moderationNotes}</p>
            </div>
          )}

          <ModerationActions requestId={req.id} currentStatus={req.status} />
        </section>
      </div>
    </div>
  );
}
