"use client";

import { useEffect } from "react";

import { PageHeader } from "@/components/ui/PageHeader";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real app we can send this to Sentry/etc.
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader title="500" caption="Something went wrong." />
      <button
        className="inline-flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
        onClick={() => reset()}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
