import Link from 'next/link';

import { listEventRequests, listPartners } from '@/lib/events/store';
import type { PartnerStatus } from '@/lib/events/types';

import { PartnerApprovalActions } from './PartnerApprovalActions';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const PARTNER_STATUS_LABELS: Record<PartnerStatus, string> = {
  pending_approval: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

const PARTNER_STATUS_COLORS: Record<PartnerStatus, string> = {
  pending_approval: 'text-yellow-300 border-yellow-400/40 bg-yellow-400/10',
  approved: 'text-green-300 border-green-400/40 bg-green-400/10',
  rejected: 'text-red-300 border-red-400/40 bg-red-400/10',
};

const STATUS_FILTER_OPTIONS: Array<{ label: string; value: PartnerStatus | 'all' }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendientes', value: 'pending_approval' },
  { label: 'Aprobados', value: 'approved' },
  { label: 'Rechazados', value: 'rejected' },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminPartnersPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const statusFilter = (
    status && ['pending_approval', 'approved', 'rejected'].includes(status)
      ? status
      : undefined
  ) as PartnerStatus | undefined;

  const partners = listPartners(statusFilter);
  const allPartners = listPartners();
  const allRequests = listEventRequests();

  const countByStatus = allPartners.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  const requestCountByPartner = allRequests.reduce<Record<string, number>>((acc, req) => {
    acc[req.partnerId] = (acc[req.partnerId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase tracking-[-0.02em]">
          Partners
        </h1>
        <p className="mt-1 font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
          {allPartners.length} partner{allPartners.length !== 1 ? 's' : ''} registrado{allPartners.length !== 1 ? 's' : ''}
          {countByStatus['pending_approval'] ? (
            <span className="ml-2 text-yellow-300">· {countByStatus['pending_approval']} pendiente{countByStatus['pending_approval'] !== 1 ? 's' : ''}</span>
          ) : null}
        </p>
      </div>

      {/* Status filter tabs */}
      <div className="mb-6 flex gap-1 border-b border-[hsl(var(--border))]">
        {STATUS_FILTER_OPTIONS.map((opt) => {
          const isActive = (statusFilter ?? 'all') === opt.value;
          const count = opt.value === 'all' ? allPartners.length : (countByStatus[opt.value] ?? 0);
          const href = opt.value === 'all' ? '/admin/partners' : `/admin/partners?status=${opt.value}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={[
                'px-4 py-2 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] transition-colors border-b-2 -mb-px',
                isActive
                  ? 'border-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
                  : 'border-transparent text-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]',
              ].join(' ')}
            >
              {opt.label}
              <span className="ml-1.5 font-normal opacity-70">({count})</span>
            </Link>
          );
        })}
      </div>

      {partners.length === 0 ? (
        <div className="border border-[hsl(var(--border))] p-10 text-center">
          <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
            No hay partners {statusFilter ? `con estado "${PARTNER_STATUS_LABELS[statusFilter]}"` : 'registrados'}
          </p>
        </div>
      ) : (
        <div className="border border-[hsl(var(--border))] overflow-hidden" style={{ borderRadius: 'var(--radius)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Nombre
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Estado
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden md:table-cell">
                  Email de contacto
                </th>
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden lg:table-cell">
                  Registro
                </th>
                <th className="px-5 py-3 text-right font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Solicitudes
                </th>
                <th className="px-5 py-3 text-right font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[hsl(var(--border))]">
              {partners.map((partner) => (
                <tr key={partner.id} className="bg-[hsl(var(--background))] hover:bg-[hsl(var(--surface))] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/partners/${partner.id}`}
                        className="font-[family-name:var(--font-barlow)] font-bold uppercase tracking-[-0.01em] hover:text-[hsl(var(--accent))] transition-colors"
                      >
                        {partner.name}
                      </Link>
                      {partner.raProfileUrl && (
                        <a
                          href={partner.raProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center border border-[hsl(var(--border))] px-1.5 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.16em] text-[hsl(var(--muted))] hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))] transition-colors"
                          title="Ver perfil en Resident Advisor"
                        >
                          RA ↗
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center border px-2 py-0.5 font-[family-name:var(--font-barlow)] text-[9px] uppercase tracking-[0.2em] ${PARTNER_STATUS_COLORS[partner.status]}`}
                    >
                      {PARTNER_STATUS_LABELS[partner.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className="text-xs text-[hsl(var(--muted))]">{partner.contactEmail}</span>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-[hsl(var(--muted))]">{formatDate(partner.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/admin/partners/${partner.id}`}
                      className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.16em] text-[hsl(var(--foreground))]"
                    >
                      {requestCountByPartner[partner.id] ?? 0}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-start justify-end gap-2">
                      <Link
                        href={`/admin/partners/${partner.id}`}
                        className="border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))]"
                      >
                        Ver detalle
                      </Link>
                      <PartnerApprovalActions partnerId={partner.id} currentStatus={partner.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
