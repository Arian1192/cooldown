# Cooldown — Design Manifesto

> **For human collaborators and AI agents alike.**  
> This document is the single source of truth for the visual identity of this project.  
> Do not introduce alternative design systems, component libraries (e.g. shadcn, Chakra, MUI),
> or neutral/pastel aesthetics. The identity described here is **intentional and permanent**.

---

## 1. The Spirit

Cooldown is a **club-culture editorial** — music, urban art, Barcelona nights.  
The design language must feel like a bold print magazine from the underground scene:
raw, dark, urgent, typographically assertive. **Never corporate. Never safe. Never neutral.**

References: [tagmag.es](https://www.tagmag.es/), i-D, Crack Magazine, Mixmag.

---

## 2. Always Dark

The site is **permanently dark**. There is no light mode, no system-mode toggle.  
Dark is not a theme — it is the identity.

```css
--background: 0 0% 5%;    /* near-black  #0d0d0d   */
--foreground: 0 0% 96%;   /* off-white   #f5f5f5   */
--surface:    0 0% 9%;    /* card bg     #171717   */
--muted:      0 0% 50%;   /* secondary text        */
--border:     0 0% 16%;   /* subtle dividers       */
```

---

## 3. Color Palette

Two accent colors only. Never add a third.

| Role | CSS variable | Value | Usage |
|---|---|---|---|
| **Acid yellow** | `--accent` | `hsl(63 100% 50%)` ≈ `#f5f500` | Primary CTA, chips, ticker, hover glow |
| **Hot red** | `--accent-2` | `hsl(350 88% 56%)` ≈ `#e8253a` | Urgent labels, errors, secondary emphasis |
| Accent text | `--accent-foreground` | `hsl(0 0% 5%)` | Text on acid-yellow bg (near-black) |

**Rules:**
- Never swap or replace acid yellow for any other color.
- Never use blue, teal, purple, green, or any "tech startup" palette.
- Gradients are only allowed as dark image overlays (`from-black/65 via-black/15 to-transparent`).

---

## 4. Typography

Two Google Fonts. No substitutes.

| Role | Font | Weights |
|---|---|---|
| **Display / headlines / UI labels** | `Barlow Condensed` | 400, 600, 700, 900 + italic |
| **Body / prose / captions** | `DM Sans` | 400, 500 |

CSS variables (set in `globals.css` via `@theme inline`):
```css
--font-display: var(--font-barlow);
--font-sans:    var(--font-dm-sans);
```

Loading in `layout.tsx` via `next/font/google`. Do not use `@import` or CDN links.

### Typography rules

- **ALL CAPS + wide tracking** for any UI label, nav item, chip, button, or section tag:  
  `font-display uppercase tracking-[0.18em]` (minimum) up to `tracking-[0.28em]`.
- **Tight negative tracking for display headlines**:  
  `tracking-[-0.03em]` on `h1`, `tracking-[-0.02em]` on `h2`.
- **Fluid headline sizes**: use `clamp()` — e.g. `text-[clamp(2.6rem,6vw,5.5rem)]`.
- Body copy uses `font-sans` at default tracking, `text-sm` for captions and meta.
- **No serif fonts. Ever.**

---

## 5. Shape & Spacing

```css
--radius: 2px;
```

This is **editorial flat**. The `2px` radius is intentional — just enough to avoid pixel-level harshness on anti-aliased screens, but functionally square.

**Rules:**
- No `rounded-lg`, `rounded-xl`, `rounded-full` buttons or cards. Use `rounded-none` or the `2px` default.
- Borders are always `border-border` (`hsl(0 0% 16%)`).
- On interactive elements, hover states **only affect border color or opacity** — never add box-shadows or glows.

---

## 6. Components

### Header / SiteShell

- **Acid ticker tape** (h-8, bg-accent, all-caps, `tracking-[0.28em]`) sits above everything.
- **Sticky header** (h-16, `bg-background/95 backdrop-blur-sm`, `border-b border-border`).
- Logo: `font-display font-black uppercase tracking-[-0.04em]`, hover → `text-accent`.
- Nav links: `font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted`, hover → `text-foreground`.
- City links: same style as nav links.
- Search CTA: solid acid-yellow block — `bg-accent text-accent-foreground`, no border-radius.
- Footer: minimal — left brand name (muted, display), right nav links (muted, display).

### Cards

Three components in `Card.tsx`:

| Component | Purpose |
|---|---|
| `Card` | Base — flat border, surface bg, no radius |
| `CardInteractive` | Hover → `border-accent/40` transition |
| `CardMedia` | Image card with aspect-ratio `16/10`, dark gradient overlay, top-left category chip |

- Category chip: `bg-accent text-accent-foreground font-display uppercase tracking-[0.2em] text-[10px]`.
- City chip (inside card body): `bg-foreground/90 text-background` (inverted) — same type style.
- Image hover: `group-hover:scale-[1.04]` with `duration-500` — subtle, not bouncy.
- **Never** add `rounded-*` to any card or chip.

### PageHeader

```
font-display font-black uppercase tracking-[-0.03em]
text-[clamp(2.6rem,6vw,5.5rem)] leading-none
```
Always `border-b border-border` divider below. Optional muted caption (`text-sm text-muted`).

### Pagination

- Page counter: `font-display text-[11px] font-bold uppercase tracking-[0.18em] text-muted`.
- Prev button: `border border-border`, hover → `border-accent text-accent`.
- Next button: solid `bg-accent text-accent-foreground`, hover → `opacity-90`.
- Container: `border-t border-border` at the top.

### ContentList (Grid)

- Two-column grid at `sm:` — `grid gap-4 sm:grid-cols-2`.
- Each item is a `CardMedia`.
- Extend to 3 columns only for feature/discovery pages with `md:grid-cols-3`.

---

## 7. Interactions

```
Transitions: always use transition-colors or transition-opacity.
Duration: default (150ms) or 500ms for image zoom. Nothing in between.
Hover: color/opacity shifts only. No shadows. No glow. No scale on UI elements (only on images inside cards).
Focus-visible: underline for text links, border shift for buttons.
```

---

## 8. What is Forbidden

The following must **never** appear in a pull request:

- ❌ Light backgrounds (`white`, `gray-50`, `slate-100`, etc.)
- ❌ Pastel or muted accent colors
- ❌ Any third-party component library (shadcn, Chakra, MUI, Radix standalone, Flowbite…)
- ❌ Rounded buttons or cards (`rounded-lg` and above)
- ❌ Box shadows on cards or containers
- ❌ Serif typefaces
- ❌ Animated entrance effects (fade-in on scroll, stagger, etc.) — the design is immediate and raw
- ❌ Gradients outside of image overlays
- ❌ Blue / purple / teal / green as UI color
- ❌ A light-mode version

---

## 9. File Map

| File | Role |
|---|---|
| `web/src/app/globals.css` | CSS custom properties, Tailwind `@theme`, base html/body styles |
| `web/src/app/layout.tsx` | Font loading (`Barlow_Condensed`, `DM_Sans`), body class, metadata |
| `web/src/components/SiteShell.tsx` | Ticker, header, nav, footer — the full page chrome |
| `web/src/components/ui/Card.tsx` | `Card`, `CardInteractive`, `CardMedia`, `CardChip`, `CardTitle`, `CardCaption` |
| `web/src/components/ui/PageHeader.tsx` | Section/page hero headline |
| `web/src/components/ui/Pagination.tsx` | Prev/Next bar |
| `web/src/components/ContentList.tsx` | Editorial grid of `CardMedia` items |
| `web/src/components/ContentDetail.tsx` | Article/detail layout |

---

## 10. Extending the Design

When adding new pages or components:

1. **Start from the palette.** Use only the 6 semantic CSS tokens (`background`, `foreground`, `surface`, `muted`, `border`, `accent`, `accent-2`). Avoid raw Tailwind color names like `yellow-400` or `gray-800`.
2. **Display type for UI, sans for content.** Every label, button, chip, and navigation element uses `font-display uppercase`.
3. **No radius above 2px.** If you need to visually separate an element, use border or background contrast.
4. **Acid yellow marks action.** It should always feel slightly aggressive — a club poster, not a SaaS dashboard.
5. **When in doubt, go darker and bolder.** This is a space for music, art, and the underground. The design should make someone feel something.
