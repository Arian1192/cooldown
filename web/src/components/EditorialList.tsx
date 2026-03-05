import Link from "next/link";

import type { ContentItem } from "@/lib/content";
import { labelForCity, labelForType } from "@/lib/content";
import { cn } from "@/lib/cn";

export function EditorialList({
  items,
  className,
}: {
  items: ContentItem[];
  className?: string;
}) {
  return (
    <div className={cn("divide-y divide-border/70", className)}>
      {items.map((item) => (
        <article
          key={`${item.type}:${item.slug}`}
          className="py-4 transition-colors hover:bg-foreground/[0.02]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="min-w-0 text-balance text-[18px] font-semibold leading-snug tracking-tight">
              <Link
                href={`/${item.type}/${item.slug}`}
                className="outline-none hover:underline focus-visible:underline"
              >
                {item.title}
              </Link>
            </h3>
            <div className="text-xs font-medium uppercase tracking-widest text-muted">
              {item.date}
            </div>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="font-medium uppercase tracking-widest text-foreground/80">
              {labelForType(item.type)}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
            <span>{labelForCity(item.city)}</span>
          </div>

          <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted">
            {item.excerpt}
          </p>
        </article>
      ))}
    </div>
  );
}
