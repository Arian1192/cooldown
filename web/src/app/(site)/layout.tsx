import { SiteShell } from '@/components/SiteShell';
import { getRequestLocale } from '@/lib/requestLocale';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getRequestLocale();
  return <SiteShell locale={locale}>{children}</SiteShell>;
}
