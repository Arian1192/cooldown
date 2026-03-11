# Sprint 1 – Next.js baseline

This repo contains the Sprint 1 baseline for the Music + Urban blog.

## App

- Next.js App Router + TypeScript lives in `web/`.

## Toolchain (local = CI)

- Node is pinned in `.nvmrc` (`22`).
- npm is pinned in `web/package.json` via `packageManager: npm@10.9.4`.
- `web/.npmrc` enables `engine-strict=true` so unsupported Node/npm versions fail fast.

### One-time setup

```bash
nvm use
corepack enable
corepack prepare npm@10.9.4 --activate
```

### Local dev

```bash
cd web
npm run check:toolchain
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
- runs `npm run check:toolchain`, `npm ci`, commit convention validation, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` in `web/`

PR governance:
- Conventional Commit format is required for commit subjects.
- Pull requests use `.github/pull_request_template.md` with accessibility and performance budget checklists.

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
- **Production deployments** on `master`

If we standardize on a different provider (Netlify / Cloudflare Pages), update this section and add provider-specific config.
