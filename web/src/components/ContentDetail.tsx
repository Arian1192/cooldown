import { notFound } from "next/navigation";

import type { ContentType } from "@/lib/content";
import { getItem, labelForCity, labelForType } from "@/lib/content";

import { EmbedDemo } from "@/components/embeds/EmbedDemo";
import { articleJsonLd } from "@/lib/structuredData";
import { siteUrl } from "@/lib/site";

export function ContentDetail({
  type,
  slug,
}: {
  type: ContentType;
  slug: string;
}) {
  const item = getItem(type, slug);
  if (!item) notFound();

  const jsonLd = articleJsonLd(item);
  const canonical = siteUrl(`/${item.type}/${item.slug}`);

  return (
    <article className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="space-y-2">
        <div className="text-xs text-muted">
          {labelForType(type)} · {labelForCity(item.city)} · {item.date}
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
          This is a template detail page. Replace with CMS content in a later
          sprint.
        </p>
        <p>
          Suggested fields: hero image, author, venue/event metadata, tags,
          embedded media.
        </p>
      </div>

      <EmbedDemo />

      <div className="text-xs text-muted">
        Permalink: {" "}
        <a className="underline" href={canonical} target="_blank" rel="noreferrer">
          {canonical}
        </a>
      </div>
    </article>
  );
}
