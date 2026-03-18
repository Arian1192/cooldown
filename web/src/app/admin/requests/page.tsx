import Link from 'next/link';

import { listEventRequests } from '@/lib/events/store';
import type { EventRequestStatus } from '@/lib/events/types';

import { ModerationActions } from './ModerationActions';

const STATUS_TABS: { value: EventRequestStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending_review', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'rejected', label: 'Rechazadas' },
];

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
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminRequestsPage({ searchParams }: PageProps) {
  const { status: rawStatus } = await searchParams;
  const validStatuses: EventRequestStatus[] = ['pending_review', 'approved', 'rejected'];
  const activeStatus =
    rawStatus && validStatuses.includes(rawStatus as EventRequestStatus)
      ? (rawStatus as EventRequestStatus)
      : undefined;

  const requests = listEventRequests(activeStatus);
  const pendingCount = listEventRequests('pending_review').length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase tracking-[-0.02em]">
            Solicitudes de eventos
          </h1>
          {pendingCount > 0 && (
            <p className="mt-1 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.18em] text-yellow-300">
              {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''} de revisión
            </p>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 border-b border-[hsl(var(--border))]">
        {STATUS_TABS.map((tab) => {
          const isActive =
            tab.value === 'all' ? !activeStatus : activeStatus === tab.value;
          const href =
            tab.value === 'all' ? '/admin/requests' : `/admin/requests?status=${tab.value}`;
          return (
            <Link
              key={tab.value}
              href={href}
              className={[
                'px-4 py-2.5 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.16em] transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
                  : 'border-transparent text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              ].join(' ')}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {requests.length === 0 ? (
        <div className="border border-[hsl(var(--border))] p-10 text-center">
          <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
            No hay solicitudes{activeStatus ? ` con estado "${STATUS_LABELS[activeStatus]}"` : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
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
                    <span className="text-xs text-[hsl(var(--muted))]">{req.partnerName}</span>
                    <span className="text-xs text-[hsl(var(--muted))]">{req.city}</span>
                    <span className="text-xs text-[hsl(var(--muted))]">{formatDate(req.date)}</span>
                    <span className="text-xs text-[hsl(var(--muted))]">
                      Recibida: {formatDate(req.createdAt)}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/requests/${req.id}`}
                  className="shrink-0 border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))]"
                >
                  Ver detalle
                </Link>
              </div>

              {req.status === 'approved' && req.linkedEventId && (
                <div className="mt-3 border-t border-[hsl(var(--border))] pt-3">
                  <Link
                    href={`/admin/events`}
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

              {req.status === 'pending_review' && (
                <div className="mt-4 border-t border-[hsl(var(--border))] pt-4">
                  <ModerationActions requestId={req.id} currentStatus={req.status} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
