import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  caption,
  className,
}: {
  title: string;
  caption?: string;
  className?: string;
}) {
  return (
    <header className={cn("space-y-2", className)}>
      <h1 className="text-balance text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      {caption ? <p className="text-sm text-muted">{caption}</p> : null}
    </header>
  );
}
