import { notFound } from "next/navigation";

import type { ContentType } from "@/lib/content";
import { getItem, labelForCity, labelForType } from "@/lib/content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";

import { EmbedDemo } from "@/components/embeds/EmbedDemo";
import { TrackEventOnRender } from "@/components/TrackEventOnRender";
import { articleJsonLd } from "@/lib/structuredData";
import { siteUrl } from "@/lib/site";

export async function ContentDetail({
  type,
  slug,
  locale,
}: {
  type: ContentType;
  slug: string;
  locale?: Locale;
}) {
  const safeLocale = locale ?? DEFAULT_LOCALE;
  const item = await getItem(type, slug, safeLocale);
  if (!item) notFound();

  const jsonLd = articleJsonLd(item, safeLocale);
  const canonical = siteUrl(`/${item.type}/${item.slug}`);

  return (
    <article className="space-y-6">
      <TrackEventOnRender
        name="detail_viewed"
        payload={{ type: item.type, slug: item.slug, city: item.city }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-2">
        <div className="text-xs text-muted">
          {labelForType(type, safeLocale)} · {labelForCity(item.city)} · {item.date}
        </div>
        <div className="flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="inline-flex rounded bg-background px-2 py-0.5 text-xs text-muted"
            >
              #{t}
            </span>
          ))}
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          {item.title}
        </h1>
        <p className="max-w-prose text-sm text-muted">{item.excerpt}</p>
      </header>

      <div className="prose max-w-none">
        <p>
          {safeLocale === "en"
            ? "This is a template detail page. Replace with CMS content in a later sprint."
            : "Esta es una pagina de detalle de plantilla. Sustituyela con contenido del CMS en un sprint posterior."}
        </p>
        <p>
          {safeLocale === "en"
            ? "Suggested fields: hero image, author, venue/event metadata, tags, embedded media."
            : "Campos sugeridos: imagen principal, autor, metadatos de sala/evento, etiquetas y media embebido."}
        </p>
      </div>

      <EmbedDemo />

      <div className="text-xs text-muted">
        {safeLocale === "en" ? "Permalink:" : "Enlace permanente:"}{" "}
        <a className="underline" href={canonical} target="_blank" rel="noreferrer">
          {canonical}
        </a>
      </div>
    </article>
  );
}
