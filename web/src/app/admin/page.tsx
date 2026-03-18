import Link from 'next/link';

import { listEventRequests, listEvents, listPartners } from '@/lib/events/store';

function StatCard({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6 hover:border-[hsl(var(--accent)/0.4)] transition-colors"
      style={{ borderRadius: 'var(--radius)' }}
    >
      <p
        className="font-[family-name:var(--font-barlow)] text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-none tracking-[-0.02em] text-[hsl(var(--foreground))]"
      >
        {value}
      </p>
      <p className="mt-2 font-[family-name:var(--font-barlow)] text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted))]">
        {label}
      </p>
    </Link>
  );
}

export default function AdminDashboard() {
  const pendingRequests = listEventRequests('pending_review');
  const partners = listPartners();
  const publishedEvents = listEvents({ status: 'published' });

  return (
    <div>
      <h1 className="font-[family-name:var(--font-barlow)] text-[clamp(1.6rem,3vw,2.4rem)] font-bold uppercase tracking-[-0.02em] mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          value={pendingRequests.length}
          label="Solicitudes pendientes"
          href="/admin/requests"
        />
        <StatCard
          value={partners.length}
          label="Partners"
          href="/admin/partners"
        />
        <StatCard
          value={publishedEvents.length}
          label="Eventos publicados"
          href="/admin/events"
        />
      </div>
    </div>
  );
}
