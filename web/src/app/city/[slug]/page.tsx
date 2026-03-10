import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { Card, CardCaption, CardTitle } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { getRequestLocale } from '@/lib/requestLocale';
import { basicOg } from '@/lib/seo';
import { cityEventJsonLd } from '@/lib/structuredData';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  if (slug !== 'barcelona' && slug !== 'madrid') return {};

  const title = slug === 'barcelona' ? 'Barcelona' : 'Madrid';
  const canonical = `/city/${slug}`;

  return basicOg({
    title,
    description:
      locale === 'en'
        ? `City landing page for ${title}.`
        : `Pagina de ciudad para ${title}.`,
    canonicalPath: canonical,
    locale,
  });
}

type City = {
  slug: 'barcelona' | 'madrid';
  title: string;
  captionEn: string;
  captionEs: string;
};

const CITIES: Record<string, City> = {
  barcelona: {
    slug: 'barcelona',
    title: 'Barcelona',
    captionEn: 'Street art, club nights, and urban culture in BCN.',
    captionEs: 'Arte urbano, noches de club y cultura urbana en BCN.',
  },
  madrid: {
    slug: 'madrid',
    title: 'Madrid',
    captionEn: 'Street art, club nights, and urban culture in MAD.',
    captionEs: 'Arte urbano, noches de club y cultura urbana en MAD.',
  },
};

export default async function CityLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) notFound();

  const jsonLd = cityEventJsonLd(city.slug, locale);

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        title={city.title}
        caption={locale === 'en' ? city.captionEn : city.captionEs}
      />

      <section className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardTitle>
            <Link href="/street-art" className="hover:underline">
              Street Art Gallery
            </Link>
          </CardTitle>
          <CardCaption>
            {locale === 'en' ? 'Recent drops and photo sets.' : 'Ultimos drops y sets de fotos.'}
          </CardCaption>
        </Card>

        <Card>
          <CardTitle>
            <Link href="/discover" className="hover:underline">
              Weekly Discover
            </Link>
          </CardTitle>
          <CardCaption>
            {locale === 'en' ? 'Weekly picks from the scene.' : 'Picks semanales de la escena.'}
          </CardCaption>
        </Card>

        <Card>
          <CardTitle>
            <Link href="/interviews" className="hover:underline">
              Interviews
            </Link>
          </CardTitle>
          <CardCaption>
            {locale === 'en' ? 'Artists, promoters, and crews.' : 'Artistas, promotores y crews.'}
          </CardCaption>
        </Card>

        <Card>
          <CardTitle>
            <Link href="/reviews" className="hover:underline">
              Reviews
            </Link>
          </CardTitle>
          <CardCaption>
            {locale === 'en' ? 'Albums, EPs, and live sets.' : 'Albumes, EPs y sets en vivo.'}
          </CardCaption>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Explore
        </h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link className="rounded-md border border-border/60 px-3 py-1.5" href="/city/barcelona">
            Barcelona
          </Link>
          <Link className="rounded-md border border-border/60 px-3 py-1.5" href="/city/madrid">
            Madrid
          </Link>
        </div>
      </section>
    </div>
  );
}
