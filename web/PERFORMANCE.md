# Performance budget (Sprint 1)

This is an MVP budget aligned to Core Web Vitals.

## Targets (mobile)

- **LCP** ≤ 2.5s (good)
- **INP** ≤ 200ms (good)
- **CLS** ≤ 0.1 (good)
- **First Load JS (target)**: keep critical routes close to or under ~220 kB in `next build` output

## Implementation notes

- Prefer `next/image` for images.
- Keep third-party scripts optional and loaded via `next/script` with `afterInteractive`.
- Avoid heavy client-side JS on list pages.

## How to check

- Local build smoke-test:
  ```bash
  cd web
  npm run lint
  npm run build
  ```
- Run Lighthouse (Chrome DevTools) on:
  - `/`
  - `/discover`
  - one detail page (e.g. `/discover/discover-1`)
- Review `next build` route output for unexpected JS growth.

Record screenshots / metrics in the relevant task comments.
