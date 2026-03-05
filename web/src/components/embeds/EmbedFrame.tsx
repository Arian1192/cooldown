import { cn } from "@/lib/cn";

export function EmbedFrame({
  title,
  src,
  aspect = "16/9",
  height,
  className,
  allow,
  sandbox,
}: {
  title: string;
  src: string;
  /** CSS aspect-ratio value like "16/9" or "1/1" */
  aspect?: string;
  /** Optional fixed height override (px) for providers that require it */
  height?: number;
  className?: string;
  allow?: string;
  sandbox?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border/60 bg-background",
        className,
      )}
      style={{ aspectRatio: height ? undefined : aspect, height }}
    >
      <iframe
        title={title}
        src={src}
        className="h-full w-full"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow={allow}
        sandbox={sandbox}
      />
    </div>
  );
}
