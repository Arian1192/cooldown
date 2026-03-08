import Image from 'next/image';

import { cn } from '@/lib/cn';

/**
 * Base card – flat, editorial, no rounded corners.
 */
export function Card({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      className={cn('border border-border bg-surface', className)}
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
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <Card
      className={cn(
        'group transition-colors hover:border-accent/40',
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
}: React.ComponentPropsWithoutRef<'div'> & {
  image: { src: string; width: number; height: number };
  imageAlt: string;
  category?: string;
}) {
  return (
    <CardInteractive
      className={cn('overflow-hidden p-0', className)}
      {...props}
    >
      <div className="relative aspect-16/10 overflow-hidden bg-foreground/5">
        <Image
          src={image.src}
          alt={imageAlt}
          width={image.width}
          height={image.height}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

        {category ? (
          <div className="absolute left-0 top-0">
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
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      className={cn(
        'inline-flex items-center bg-accent px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'h3'>) {
  return (
    <h3
      className={cn(
        'font-display text-[17px] font-bold uppercase leading-tight tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

export function CardCaption({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'p'>) {
  return (
    <p
      className={cn(
        'mt-1 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-muted',
        className,
      )}
      {...props}
    />
  );
}
