import Link from 'next/link';

import { PageHeader } from '@/components/ui/PageHeader';
import { getRequestLocale } from '@/lib/requestLocale';

export default async function NotFound() {
  const locale = await getRequestLocale();

  return (
    <div className="space-y-5">
      <PageHeader
        title="404"
        caption={
          locale === 'en'
            ? 'That page does not exist.'
            : 'Esa pagina no existe.'
        }
      />
      <Link
        className="inline-flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
        href="/"
      >
        {locale === 'en' ? 'Back home' : 'Volver al inicio'}
      </Link>
    </div>
  );
}
