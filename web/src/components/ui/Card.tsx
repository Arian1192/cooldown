import { cn } from "@/lib/cn";

export function Card({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-surface p-4 shadow-sm",
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
      className={cn("text-pretty font-medium leading-snug", className)}
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
