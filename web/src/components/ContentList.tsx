import Link from "next/link";

import type { ContentItem, ContentType } from "@/lib/content";
import { labelForType } from "@/lib/content";
import { Card, CardCaption, CardTitle } from "@/components/ui/Card";

export function ContentList({
  type,
  items,
}: {
  type: ContentType;
  items: ContentItem[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <Card key={item.slug} className="transition hover:border-border">
          <CardTitle>
            <Link href={`/${type}/${item.slug}`} className="hover:underline">
              {item.title}
            </Link>
          </CardTitle>
          <CardCaption>
            <span className="mr-2 inline-flex rounded bg-background px-2 py-0.5 text-xs text-muted">
              {labelForType(type)}
            </span>
            <span className="text-xs">{item.date}</span>
          </CardCaption>
          <p className="mt-3 text-sm text-muted">{item.excerpt}</p>
        </Card>
      ))}
    </div>
  );
}
