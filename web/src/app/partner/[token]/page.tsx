import Link from 'next/link';
import { notFound } from 'next/navigation';

import { findPartnerByToken, listEventRequestsByPartnerId } from '@/lib/events/store';
import type { EventRequestRecord, EventRequestStatus } from '@/lib/events/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

const STATUS_LABEL: Record<EventRequestStatus, string> = {
  pending_review: 'En revisión',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const STATUS_COLOR: Record<EventRequestStatus, string> = {
  pending_review: 'text-yellow-400 bg-yellow-400/10',
  approved: 'text-green-400 bg-green-400/10',
  rejected: 'text-red-400 bg-red-400/10',
};

function StatusBadge({ status }: { status: EventRequestStatus }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function RequestCard({ request }: { request: EventRequestRecord }) {
  const date = new Date(request.date);
  const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="border border-white/10 rounded-lg p-4 flex flex-col gap-2 bg-white/5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-white text-sm leading-snug">{request.title}</h3>
        <StatusBadge status={request.status} />
      </div>
      <div className="text-xs text-white/50 flex flex-wrap gap-3">
        <span>{dateStr}</span>
        <span>{request.venue}, {request.city}</span>
        {request.eventType && <span className="capitalize">{request.eventType.replace('_', ' ')}</span>}
      </div>
      {request.moderationNotes && (
        <p className="text-xs text-white/60 border-l-2 border-white/20 pl-3 mt-1">
          {request.moderationNotes}
        </p>
      )}
    </div>
  );
}

export default async function PartnerPortalPage({ params }: PageProps) {
  const { token } = await params;
  const partner = findPartnerByToken(token);

  if (!partner) {
    notFound();
  }

  const requests = listEventRequestsByPartnerId(partner.id);

  const pending = requests.filter((r) => r.status === 'pending_review');
  const approved = requests.filter((r) => r.status === 'approved');
  const rejected = requests.filter((r) => r.status === 'rejected');

  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 hover:text-[#f5f500] transition-colors"
          >
            Cooldown
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Portal de partners
          </h1>
          <p className="mt-1 text-white/50 text-sm">
            Bienvenido, <span className="text-[#f5f500] font-semibold">{partner.name}</span>
          </p>
        </div>

        {/* Submit new event */}
        <div className="mb-10 rounded-lg border border-[#f5f500]/30 bg-[#f5f500]/5 p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#f5f500]">Enviar nuevo evento</p>
            <p className="text-xs text-white/50 mt-0.5">
              Propón un evento para que aparezca en Cooldown.
            </p>
          </div>
          <Link
            href={`/events/submit?partner=${partner.id}&partnerName=${encodeURIComponent(partner.name)}`}
            className="shrink-0 rounded bg-[#f5f500] px-4 py-2 text-xs font-bold uppercase tracking-widest text-black hover:bg-[#f5f500]/80 transition-colors"
          >
            Enviar evento
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-10">
          {[
            { label: 'En revisión', count: pending.length, color: 'text-yellow-400' },
            { label: 'Aprobados', count: approved.length, color: 'text-green-400' },
            { label: 'Rechazados', count: rejected.length, color: 'text-red-400' },
          ].map(({ label, count, color }) => (
            <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Event requests */}
        {requests.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            Aún no has enviado ningún evento.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {pending.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
                  En revisión
                </h2>
                <div className="flex flex-col gap-2">
                  {pending.map((r) => <RequestCard key={r.id} request={r} />)}
                </div>
              </section>
            )}

            {approved.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
                  Aprobados
                </h2>
                <div className="flex flex-col gap-2">
                  {approved.map((r) => <RequestCard key={r.id} request={r} />)}
                </div>
              </section>
            )}

            {rejected.length > 0 && (
              <section>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
                  Rechazados
                </h2>
                <div className="flex flex-col gap-2">
                  {rejected.map((r) => <RequestCard key={r.id} request={r} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
