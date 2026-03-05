import Image from "next/image";
import Link from "next/link";

import { EditorialList } from "@/components/EditorialList";
import { getItem, getPagedItems } from "@/lib/content";

export default function Home() {
  const featured = getItem("discover", "discover-1");
  const { items } = getPagedItems("discover", 1, 8);

  return (
    <div className="space-y-10">
      {/* Hero (TagMag-inspired) */}
      <section className="relative overflow-hidden border-y border-border/70 bg-foreground text-background">
        {/* subtle noise / grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(255,45,85,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:120px_120px]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="grid items-end gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-background/75">
                Music • Urban Art • Club Culture
              </p>
              <h1 className="text-balance text-[48px] font-semibold leading-[1.02] tracking-tight sm:text-[56px]">
                Cooldown.
                <span className="block text-background/70">
                  Weekly picks + street culture.
                </span>
              </h1>
              <p className="max-w-[70ch] text-pretty text-base leading-relaxed text-background/75">
                Minimal, clean, urban — editorial layouts first. Strong typography,
                rule lines, and deliberate imagery.
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

            {/* Featured module */}
            {featured ? (
              <article className="border border-background/15 bg-background/[0.03]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={featured.coverImageSrc}
                    alt={featured.coverImageAlt}
                    width={1200}
                    height={750}
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute left-4 top-4 text-xs font-semibold uppercase tracking-[0.32em] text-background/75">
                    Featured
                  </div>
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="text-balance text-[20px] font-semibold leading-snug tracking-tight">
                    <Link
                      href={`/discover/${featured.slug}`}
                      className="outline-none hover:underline focus-visible:underline"
                    >
                      {featured.title}
                    </Link>
                  </h2>
                  <p className="text-sm leading-relaxed text-background/70">
                    {featured.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs uppercase tracking-widest text-background/60">
                    <span>{featured.date}</span>
                    <Link
                      href={`/discover/${featured.slug}`}
                      className="font-semibold text-background hover:underline"
                    >
                      Read
                    </Link>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </section>

      {/* Latest (editorial rows) */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-border/70 pb-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-muted">
              Discover
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight">
              Latest
            </h2>
          </div>
          <Link className="text-sm font-semibold text-foreground hover:underline" href="/discover">
            View all
          </Link>
        </div>
        <EditorialList items={items} />
      </section>
    </div>
  );
}
