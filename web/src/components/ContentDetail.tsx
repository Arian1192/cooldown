import { notFound } from "next/navigation";

import type { ContentType } from "@/lib/content";
import { getItem, labelForType } from "@/lib/content";

export function ContentDetail({
  type,
  slug,
}: {
  type: ContentType;
  slug: string;
}) {
  const item = getItem(type, slug);
  if (!item) notFound();

  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <div className="text-xs text-muted">
          {labelForType(type)} · {item.date}
        </div>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          {item.title}
        </h1>
        <p className="max-w-prose text-sm text-muted">{item.excerpt}</p>
      </header>

      <div className="prose prose-invert:prose-invert max-w-none">
        <p>
          This is a template detail page. Replace with CMS content in a later
          sprint.
        </p>
        <p>
          Suggested fields: hero image, author, venue/event metadata, tags,
          embedded media.
        </p>
      </div>
    </article>
  );
}
