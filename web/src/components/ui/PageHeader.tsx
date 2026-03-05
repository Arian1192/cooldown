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
    <header className={cn("space-y-1.5", className)}>
      <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-tight">
        {title}
      </h1>
      {caption ? (
        <p className="max-w-[70ch] text-sm leading-relaxed text-muted">
          {caption}
        </p>
      ) : null}
    </header>
  );
}
