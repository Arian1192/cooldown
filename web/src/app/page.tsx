export default function Home() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          Sprint 1 baseline is live.
        </h1>
        <p className="max-w-prose text-pretty text-sm text-muted">
          Next.js (App Router) + TypeScript + Tailwind v4. This is a thin layout
          shell with design tokens (CSS variables) to unblock feature work.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border/60 bg-surface p-4">
          <h2 className="font-medium">Design tokens</h2>
          <p className="text-sm text-muted">
            Tokens live in <code>src/app/globals.css</code>.
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-surface p-4">
          <h2 className="font-medium">Deployment</h2>
          <p className="text-sm text-muted">
            Recommended: Vercel with Root Directory set to <code>web</code>.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <a
          className="inline-flex items-center rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground"
          href="https://nextjs.org/docs"
          target="_blank"
          rel="noreferrer"
        >
          Next.js Docs
        </a>
        <a
          className="inline-flex items-center rounded-md border border-border/60 px-3 py-2 text-sm font-medium"
          href="https://vercel.com/docs"
          target="_blank"
          rel="noreferrer"
        >
          Vercel Docs
        </a>
      </div>
    </div>
  );
}
