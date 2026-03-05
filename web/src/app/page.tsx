import Link from "next/link";

import { EditorialList } from "@/components/EditorialList";
import { getPagedItems } from "@/lib/content";

export default function Home() {
  const { items } = getPagedItems("discover", 1, 6);

  return (
    <div className="space-y-8">
      {/* Hero (TagMag-inspired) */}
      <section className="relative overflow-hidden border-y border-border/70 bg-foreground text-background">
        <div className="mx-auto max-w-5xl px-4 py-14">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-background/75">
              Music • Urban Art • Club Culture
            </p>
            <h1 className="text-balance text-[42px] font-semibold leading-[1.05] tracking-tight">
              Cooldown.
              <span className="block text-background/70">Weekly picks + street culture.</span>
            </h1>
            <p className="max-w-[70ch] text-pretty text-base leading-relaxed text-background/75">
              Minimal, clean, urban. Editorial layouts first — not a grid of boxes.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
                href="/discover"
              >
                Explore Discover
              </Link>
              <Link
                className="inline-flex items-center rounded-md border border-background/25 px-4 py-2 text-sm font-semibold text-background"
                href="/street-art"
              >
                Street Art
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest (editorial rows) */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-balance text-xl font-semibold tracking-tight">
            Latest from Discover
          </h2>
          <Link className="text-sm font-medium text-muted hover:underline" href="/discover">
            View all
          </Link>
        </div>
        <EditorialList items={items} />
      </section>
    </div>
  );
}
