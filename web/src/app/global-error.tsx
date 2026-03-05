"use client";

import Link from "next/link";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <h1>500</h1>
        <p>Global error boundary triggered.</p>
        <pre style={{ whiteSpace: "pre-wrap" }}>{String(error.message)}</pre>
        <p>
          <Link href="/">Back home</Link>
        </p>
      </body>
    </html>
  );
}
