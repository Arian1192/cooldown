import type { Metadata } from 'next';
import Link from 'next/link';

import { PartnerEventSubmitForm } from '@/components/events/PartnerEventSubmitForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { basicOg } from '@/lib/seo';

export const metadata: Metadata = basicOg({
  title: 'Submit Event',
  description: 'Formulario para que partners envien eventos a moderacion sin acceso al admin.',
  canonicalPath: '/events/submit',
});

export default function SubmitEventPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Submit Event"
        caption="Envio publico para partners. Completa lineup, genero, tipo, fecha, venue y assets. El equipo revisa la solicitud antes de publicar."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="border border-border bg-surface p-5">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Partner Portal</p>
          <p className="mt-2 text-sm text-muted">
            Si incluyes un link de Resident Advisor puedes autocompletar campos iniciales. Revisa el resultado antes de enviar.
          </p>
        </div>
        <aside className="border border-border bg-surface p-5">
          <h2 className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Moderation</h2>
          <p className="mt-2 text-sm text-muted">
            Cada solicitud entra en estado <strong>pending_review</strong> y aparece en el tablero interno.
          </p>
          <Link
            href="/events/moderation"
            className="mt-4 inline-flex items-center border border-border px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
          >
            Open Moderation Queue
          </Link>
        </aside>
      </section>

      <section className="border border-border bg-surface p-5">
        <PartnerEventSubmitForm />
      </section>
    </div>
  );
}
