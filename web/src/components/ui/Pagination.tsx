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
    <nav className={cn("flex items-center justify-between", className)}>
      <div className="text-xs text-muted">
        Page {page} of {pageCount}
      </div>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={{ pathname: basePath, query: { page: String(prev) } }}
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
          >
            Prev
          </Link>
        ) : (
          <span className="rounded-md border border-border/20 px-3 py-1.5 text-sm text-muted">
            Prev
          </span>
        )}

        {next ? (
          <Link
            href={{ pathname: basePath, query: { page: String(next) } }}
            className="rounded-md border border-border/60 px-3 py-1.5 text-sm"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-md border border-border/20 px-3 py-1.5 text-sm text-muted">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
