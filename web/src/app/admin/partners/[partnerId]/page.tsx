import Link from 'next/link';
import { notFound } from 'next/navigation';

import { listEventRequests, listPartners } from '@/lib/events/store';
import type { EventRequestStatus } from '@/lib/events/types';

const STATUS_LABELS: Record<EventRequestStatus, string> = {
  pending_review: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const STATUS_COLORS: Record<EventRequestStatus, string> = {
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
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

interface PageProps {
  params: Promise<{ partnerId: string }>;
}

export default async function AdminPartnerDetailPage({ params }: PageProps) {
  const { partnerId } = await params;

  const partners = listPartners();
  const partner = partners.find((p) => p.id === partnerId);

  if (!partner) {
    notFound();
  }

  const allRequests = listEventRequests();
  const partnerRequests = allRequests.filter((r) => r.partnerId === partnerId);
  partnerRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const countByStatus = partnerRequests.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      {/* Back link */}
      <div className="mb-6">
        <Link
          href="/admin/partners"
          className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          ← Volver a Partners
        </Link>
      </div>

      {/* Partner header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase tracking-[-0.02em]">
            {partner.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-[hsl(var(--muted))]">{partner.slug}</p>
        </div>
        {partner.raProfileUrl && (
          <a
            href={partner.raProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))]"
          >
            Ver perfil en Resident Advisor ↗
          </a>
        )}
      </div>

      {/* Partner metadata */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5" style={{ borderRadius: 'var(--radius)' }}>
        <div>
          <p className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] mb-1">
            Email de contacto
          </p>
          <p className="text-sm">{partner.contactEmail}</p>
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] mb-1">
            Fecha de registro
          </p>
          <p className="text-sm">{formatDate(partner.createdAt)}</p>
        </div>
        <div>
          <p className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] mb-1">
            Solicitudes enviadas
          </p>
          <p className="text-sm">
            {partnerRequests.length}
            {partnerRequests.length > 0 && (
              <span className="ml-2 text-xs text-[hsl(var(--muted))]">
                ({countByStatus['approved'] ?? 0} aprobadas · {countByStatus['pending_review'] ?? 0} pendientes · {countByStatus['rejected'] ?? 0} rechazadas)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Event requests history */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-barlow)] text-sm font-bold uppercase tracking-[0.12em]">
          Historial de solicitudes
        </h2>
        <Link
          href={`/admin/requests`}
          className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          Ver todas las solicitudes →
        </Link>
      </div>

      {partnerRequests.length === 0 ? (
        <div className="border border-[hsl(var(--border))] p-10 text-center">
          <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
            Este partner no ha enviado solicitudes todavía
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {partnerRequests.map((req) => (
            <div
              key={req.id}
              className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.2em] ${STATUS_COLORS[req.status]}`}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                    <span className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--muted))]">
                      {EVENT_TYPE_LABELS[req.eventType] ?? req.eventType}
                    </span>
                  </div>
                  <Link
                    href={`/admin/requests/${req.id}`}
                    className="font-[family-name:var(--font-barlow)] text-base font-bold uppercase tracking-[-0.01em] hover:text-[hsl(var(--accent))] transition-colors"
                  >
                    {req.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-xs text-[hsl(var(--muted))]">{req.city}</span>
                    <span className="text-xs text-[hsl(var(--muted))]">{formatDate(req.date)}</span>
                    <span className="text-xs text-[hsl(var(--muted))]">
                      Enviada: {formatDate(req.createdAt)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/requests/${req.id}`}
                  className="shrink-0 border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))]"
                >
                  Ver solicitud
                </Link>
              </div>

              {req.status === 'approved' && req.linkedEventId && (
                <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
                  <Link
                    href="/admin/events"
                    className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-green-300 transition-opacity hover:opacity-80"
                  >
                    → Ver evento publicado
                  </Link>
                </div>
              )}

              {req.moderationNotes && req.status !== 'pending_review' && (
                <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
                  <p className="font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] mb-1">
                    Nota de moderación
                  </p>
                  <p className="text-sm text-[hsl(var(--foreground)/0.8)]">{req.moderationNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
