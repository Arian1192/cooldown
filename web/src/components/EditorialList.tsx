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
    <div className={cn("divide-y divide-border", className)}>
      {items.map((item) => (
        <article
          key={`${item.type}:${item.slug}`}
          className="group py-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="min-w-0 font-display text-[clamp(1.1rem,2.5vw,1.45rem)] font-bold uppercase leading-tight tracking-tight">
              <Link
                href={`/${item.type}/${item.slug}`}
                className="transition-colors group-hover:text-accent outline-none focus-visible:text-accent"
              >
                {item.title}
              </Link>
            </h3>
            <div className="font-display text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
              {item.date}
            </div>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
              {labelForType(item.type)}
            </span>
            <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-muted">
              {labelForCity(item.city)}
            </span>
          </div>

          <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted">
            {item.excerpt}
          </p>
        </article>
      ))}
    </div>
  );
}
