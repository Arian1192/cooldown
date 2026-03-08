import { cn } from '@/lib/cn';

export function EmbedFrame({
  title,
  src,
  aspect = '16/9',
  height,
  className,
  allow,
  sandbox,
  rounded = false,
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
  /** Allow rounded corners for embed players (overrides the flat design default) */
  rounded?: boolean;
}) {
  return (
    <div
      className={cn(
        'overflow-hidden border border-border',
        rounded && 'rounded-xl',
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
