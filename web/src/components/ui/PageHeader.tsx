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
    <header className={cn("mb-8 border-b border-border pb-6", className)}>
      <h1 className="font-display text-[clamp(2.6rem,6vw,5.5rem)] font-black uppercase leading-none tracking-[-0.03em]">
        {title}
      </h1>
      {caption ? (
        <p className="mt-3 max-w-[70ch] text-sm leading-relaxed text-muted">
          {caption}
        </p>
      ) : null}
    </header>
  );
}
