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
- runs `npm ci`, `npm run lint`, `npm run build` in `web/`

## Deployment (recommended: Vercel)

Vercel supports monorepos. Configure:
- **Root Directory**: `web`
- Build Command: `next build` (default)
- Output: `.next` (default)

This will automatically create:
- **Preview deployments** for PRs
- **Production deployments** on `main`

If we standardize on a different provider (Netlify / Cloudflare Pages), update this section and add provider-specific config.
