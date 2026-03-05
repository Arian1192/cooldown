import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Base card (kept backward-compatible).
 */
export function Card({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-surface p-3 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Variant 1: Interactive / hoverable card.
 */
export function CardInteractive({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <Card
      className={cn(
        "group transition-all hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-md",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Variant 2: Media card (image + category chip + hover).
 */
export function CardMedia({
  image,
  imageAlt,
  category,
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  image: { src: string; width: number; height: number };
  imageAlt: string;
  category?: string;
}) {
  return (
    <CardInteractive className={cn("overflow-hidden p-0", className)} {...props}>
      <div className="relative aspect-[16/10] overflow-hidden bg-foreground/5">
        <Image
          src={image.src}
          alt={imageAlt}
          width={image.width}
          height={image.height}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {category ? (
          <div className="absolute left-3 top-3">
            <CardChip>{category}</CardChip>
          </div>
        ) : null}
      </div>

      <div className="p-3">{children}</div>
    </CardInteractive>
  );
}

export function CardChip({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-2 py-1 text-[11px] font-semibold uppercase tracking-widest text-accent-foreground shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) {
  return (
    <h3
      className={cn(
        "text-pretty text-[15px] font-semibold leading-snug tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardCaption({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"p">) {
  return (
    <p className={cn("mt-1 text-sm text-muted", className)} {...props} />
  );
}
