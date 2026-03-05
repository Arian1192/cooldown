import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardCaption, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { cityEventJsonLd } from "@/lib/structuredData";
import { env } from "@/env";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== "barcelona" && slug !== "madrid") return {};

  const title = slug === "barcelona" ? "Barcelona" : "Madrid";
  const canonical = `/city/${slug}`;

  return {
    title,
    description: `City landing page for ${title}.`,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: `${title} · ${env.NEXT_PUBLIC_SITE_NAME}`,
      description: `City landing page for ${title}.`,
      url: canonical,
      siteName: env.NEXT_PUBLIC_SITE_NAME,
    },
  };
}

type City = {
  slug: "barcelona" | "madrid";
  title: string;
  caption: string;
};

const CITIES: Record<string, City> = {
  barcelona: {
    slug: "barcelona",
    title: "Barcelona",
    caption: "Street art, club nights, and urban culture in BCN (template page).",
  },
  madrid: {
    slug: "madrid",
    title: "Madrid",
    caption: "Street art, club nights, and urban culture in MAD (template page).",
  },
};

export default async function CityLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) notFound();

  const jsonLd = cityEventJsonLd(city.slug);

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader title={city.title} caption={city.caption} />

      <section className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardTitle>
            <Link href="/street-art" className="hover:underline">
              Street Art Gallery
            </Link>
          </CardTitle>
          <CardCaption>Recent drops & photo sets.</CardCaption>
        </Card>

        <Card>
          <CardTitle>
            <Link href="/discover" className="hover:underline">
              Weekly Discover
            </Link>
          </CardTitle>
          <CardCaption>Weekly picks from the scene.</CardCaption>
        </Card>

        <Card>
          <CardTitle>
            <Link href="/interviews" className="hover:underline">
              Interviews
            </Link>
          </CardTitle>
          <CardCaption>Artists, promoters, and crews.</CardCaption>
        </Card>

        <Card>
          <CardTitle>
            <Link href="/reviews" className="hover:underline">
              Reviews
            </Link>
          </CardTitle>
          <CardCaption>Albums, EPs, and live sets.</CardCaption>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Explore</h2>
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            className="rounded-md border border-border/60 px-3 py-1.5"
            href="/city/barcelona"
          >
            Barcelona
          </Link>
          <Link
            className="rounded-md border border-border/60 px-3 py-1.5"
            href="/city/madrid"
          >
            Madrid
          </Link>
        </div>
      </section>
    </div>
  );
}
