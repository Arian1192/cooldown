import Link from "next/link";

import type { ContentItem } from "@/lib/content";
import { labelForCity, labelForType } from "@/lib/content";
import { Card, CardCaption, CardTitle } from "@/components/ui/Card";

export function ContentList({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Card
          key={`${item.type}:${item.slug}`}
          className="transition hover:border-border"
        >
          <CardTitle>
            <Link
              href={`/${item.type}/${item.slug}`}
              className="hover:underline"
            >
              {item.title}
            </Link>
          </CardTitle>
          <CardCaption>
            <span className="mr-2 inline-flex rounded bg-background px-2 py-0.5 text-xs text-muted">
              {labelForType(item.type)}
            </span>
            <span className="mr-2 inline-flex rounded bg-background px-2 py-0.5 text-xs text-muted">
              {labelForCity(item.city)}
            </span>
            <span className="text-xs">{item.date}</span>
          </CardCaption>
          <p className="mt-3 text-sm text-muted">{item.excerpt}</p>
        </Card>
      ))}
    </div>
  );
}
