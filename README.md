# Sprint 1 – Next.js baseline

This repo contains the Sprint 1 baseline for the Music + Urban blog.

## App

- Next.js App Router + TypeScript lives in `web/`.

### Local dev

```bash
cd web
npm ci
npm run dev
```

### Build

```bash
cd web
npm run build
npm run start
```

## CI

GitHub Actions workflow: `.github/workflows/ci.yml`
- runs `npm ci`, `npm run lint`, `npm run test`, `npm run build` in `web/`

## Internal linking conventions

Route patterns (Sprint 1 templates):

- Content lists:
  - `/discover`, `/street-art`, `/interviews`, `/reviews`
  - Pagination uses query param: `?page=2`
- Content detail:
  - `/discover/[slug]`, `/street-art/[slug]`, `/interviews/[slug]`, `/reviews/[slug]`
- City landing pages:
  - `/city/barcelona`, `/city/madrid` (implemented via `/city/[slug]`)

Conventions:
- Use absolute internal links (`/path`) via `next/link`.
- Prefer `slug` in URLs for content; IDs stay internal.

## Deployment (recommended: Vercel)

Vercel supports monorepos. Configure:
- **Root Directory**: `web`
- Build Command: `next build` (default)
- Output: `.next` (default)

This will automatically create:
- **Preview deployments** for PRs
- **Production deployments** on `main`

If we standardize on a different provider (Netlify / Cloudflare Pages), update this section and add provider-specific config.
