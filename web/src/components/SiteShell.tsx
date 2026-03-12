import Link from "next/link";

const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/events", label: "Events" },
  { href: "/street-art", label: "Street Art" },
  { href: "/interviews", label: "Interviews" },
  { href: "/reviews", label: "Reviews" },
];

const CITIES = [
  { href: "/city/barcelona", label: "BCN" },
  { href: "/city/madrid", label: "MAD" },
];

const TICKER_ITEMS = ["Music", "Urban Art", "Club Culture", "Street Art", "Barcelona", "Madrid", "2026"];

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Acid ticker tape */}
      <div className="h-8 overflow-hidden bg-accent text-accent-foreground">
        <div className="flex h-full items-center gap-5 whitespace-nowrap px-4 font-display text-[10px] font-bold uppercase tracking-[0.28em]">
          {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i}>{item}</span>
          ))}
        </div>
      </div>

      {/* Sticky header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link
            href="/"
            className="font-display text-[1.65rem] font-black uppercase leading-none tracking-[-0.04em] transition-colors hover:text-accent"
          >
            Music+Urban
          </Link>

          <nav className="hidden items-center gap-5 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}

            <span className="h-3 w-px bg-border" aria-hidden />

            {CITIES.map((city) => (
              <Link
                key={city.href}
                href={city.href}
                className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-foreground"
              >
                {city.label}
              </Link>
            ))}

            <span className="h-3 w-px bg-border" aria-hidden />

            <Link
              href="/search"
              className="inline-flex items-center bg-accent px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.18em] text-accent-foreground transition-opacity hover:opacity-85"
            >
              Search
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        {children}
      </main>

      <footer className="mt-16 border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 lg:px-8">
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            Music · Urban Art · Club Culture · 2026
          </span>
          <Link
            href="/rss.xml"
            className="font-display text-[11px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-accent"
          >
            RSS
          </Link>
        </div>
      </footer>
    </div>
  );
}
