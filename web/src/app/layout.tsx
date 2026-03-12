import type { Metadata } from 'next';
import { Barlow_Condensed, DM_Sans } from 'next/font/google';

import { Analytics } from '@/components/Analytics';
import { SiteShell } from '@/components/SiteShell';
import { env } from '@/env';
import { localeToOpenGraph } from '@/lib/i18n';
import { getRequestLocale } from '@/lib/requestLocale';
import { siteUrl } from '@/lib/site';
import { websiteJsonLd } from '@/lib/structuredData';
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const description =
    locale === 'en'
      ? 'Music, urban art, and club culture.'
      : 'Musica, arte urbano y cultura de club.';

  return {
    metadataBase: new URL(env.SITE_URL),
    title: {
      default: env.NEXT_PUBLIC_SITE_NAME,
      template: `%s · ${env.NEXT_PUBLIC_SITE_NAME}`,
    },
    description,
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      title: env.NEXT_PUBLIC_SITE_NAME,
      description,
      url: '/',
      siteName: env.NEXT_PUBLIC_SITE_NAME,
      locale: localeToOpenGraph(locale),
      images: [
        {
          url: siteUrl('/placeholders/urban-cover.svg'),
          alt: env.NEXT_PUBLIC_SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: env.NEXT_PUBLIC_SITE_NAME,
      description,
      images: [siteUrl('/placeholders/urban-cover.svg')],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();
  const jsonLd = websiteJsonLd(locale);

  return (
    <html lang={locale}>
      <body className={`${barlow.variable} ${dmSans.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <SiteShell locale={locale}>{children}</SiteShell>
      </body>
    </html>
  );
}
