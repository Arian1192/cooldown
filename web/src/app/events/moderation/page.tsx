import type { Metadata } from 'next';

import { ModerationBackoffice } from '@/components/events/ModerationBackoffice';
import { PageHeader } from '@/components/ui/PageHeader';
import { basicOg } from '@/lib/seo';

export const metadata: Metadata = basicOg({
  title: 'Events Moderation Backoffice',
  description: 'Panel interno para moderar solicitudes de partner events y publicar eventos aprobados.',
  canonicalPath: '/events/moderation',
});

export default function EventsModerationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Partner Events Moderation"
        caption="Cola interna de revision para solicitudes de partners. Aplica filtros por estado, partner y fecha; luego aprueba, rechaza o edita sin recargar la pagina."
      />

      <ModerationBackoffice />
    </div>
  );
}
