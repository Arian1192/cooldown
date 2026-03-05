import Link from "next/link";

import type { ContentItem } from "@/lib/content";
import { labelForCity, labelForType } from "@/lib/content";
import { CardCaption, CardChip, CardMedia, CardTitle } from "@/components/ui/Card";

export function ContentList({ items }: { items: ContentItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <CardMedia
          key={`${item.type}:${item.slug}`}
          image={{ src: item.coverImageSrc, width: 1200, height: 750 }}
          imageAlt={item.coverImageAlt}
          category={labelForType(item.type)}
        >
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="min-w-0">
              <Link
                href={`/${item.type}/${item.slug}`}
                className="outline-none hover:underline focus-visible:underline"
              >
                {item.title}
              </Link>
            </CardTitle>
            <CardChip className="shrink-0 bg-foreground/90 text-background">
              {labelForCity(item.city)}
            </CardChip>
          </div>
          <CardCaption>{item.date}</CardCaption>
          <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
        </CardMedia>
      ))}
    </div>
  );
}
