import Link from "next/link";

import { cn } from "@/lib/cn";

export function Pagination({
  basePath,
  page,
  pageCount,
  className,
}: {
  basePath: string;
  page: number;
  pageCount: number;
  className?: string;
}) {
  const prev = page > 1 ? page - 1 : null;
  const next = page < pageCount ? page + 1 : null;

  return (
    <nav className={cn("flex items-center justify-between border-t border-border pt-6", className)}>
      <div className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted">
        {page} / {pageCount}
      </div>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={{ pathname: basePath, query: { page: String(prev) } }}
            className="inline-flex items-center border border-border px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] transition-colors hover:border-accent hover:text-accent"
          >
            ← Prev
          </Link>
        ) : (
          <span className="inline-flex items-center border border-border/30 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted/40">
            ← Prev
          </span>
        )}

        {next ? (
          <Link
            href={{ pathname: basePath, query: { page: String(next) } }}
            className="inline-flex items-center bg-accent px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            Next →
          </Link>
        ) : (
          <span className="inline-flex items-center border border-border/30 px-4 py-2 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted/40">
            Next →
          </span>
        )}
      </div>
    </nav>
  );
}
