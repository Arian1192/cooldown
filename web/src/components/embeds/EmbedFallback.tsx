import { Card, CardCaption, CardTitle } from "@/components/ui/Card";

export function EmbedFallback({
  provider,
  reason,
  href,
}: {
  provider: string;
  reason?: string;
  href?: string;
}) {
  return (
    <Card>
      <CardTitle>{provider} embed unavailable</CardTitle>
      <CardCaption>
        {reason ??
          "This embed could not be loaded (blocked by browser policy, provider restrictions, or invalid URL)."}
      </CardCaption>
      {href ? (
        <p className="mt-3 text-sm">
          <a className="underline" href={href} target="_blank" rel="noreferrer">
            Open externally
          </a>
        </p>
      ) : null}
    </Card>
  );
}
