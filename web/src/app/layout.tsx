import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';

import { Analytics } from '@/components/Analytics';
import { SiteShell } from '@/components/SiteShell';
import { env } from '@/env';
import './globals.css';

const barlow = Barlow_Condensed({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: {
    default: env.NEXT_PUBLIC_SITE_NAME,
    template: `%s · ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: 'Música, arte urbano y cultura de club.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: env.NEXT_PUBLIC_SITE_NAME,
    description: 'Música, arte urbano y cultura de club.',
    url: '/',
    siteName: env.NEXT_PUBLIC_SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${barlow.variable} ${dmSans.variable} antialiased`}>
        <Analytics />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
