import Link from 'next/link';

import { listEventRequests, listPartners } from '@/lib/events/store';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminPartnersPage() {
  const partners = listPartners();
  const allRequests = listEventRequests();

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
          {partners.length} partner{partners.length !== 1 ? 's' : ''} registrado{partners.length !== 1 ? 's' : ''}
        </p>
      </div>

      {partners.length === 0 ? (
        <div className="border border-[hsl(var(--border))] p-10 text-center">
          <p className="font-[family-name:var(--font-barlow)] text-[11px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
            No hay partners registrados
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
                <th className="px-5 py-3 text-left font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] hidden sm:table-cell">
                  Slug
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
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="font-mono text-xs text-[hsl(var(--muted))]">{partner.slug}</span>
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
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/partners/${partner.id}`}
                        className="border border-[hsl(var(--border))] px-3 py-1.5 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted))] transition-colors hover:border-[hsl(var(--accent)/0.4)] hover:text-[hsl(var(--foreground))]"
                      >
                        Ver detalle
                      </Link>
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
