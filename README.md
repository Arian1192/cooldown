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

Additional policy workflow: `.github/workflows/pr-template-enforcement.yml`
- validates PR body completeness against `.github/pull_request_template.md`

## Engineering process docs

- Technical PR workflow and done-gate: `docs/engineering/pr-workflow.md`

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

## Deployment (Coolify)

This repo is now ready for root-level Docker deployment in Coolify.

- Build Pack: `Dockerfile`
- Dockerfile Location: `./Dockerfile`
- Port: `3000`
- Healthcheck Path: `/`

Required runtime environment variables:

- `SITE_URL` (public frontend URL, e.g. `https://cooldown.ariancoro.com`)
- `STRAPI_URL` (public CMS URL, e.g. `https://cms.cooldown.ariancoro.com`)

Optional analytics variables:

- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`

Notes for Coolify:

- No monorepo subdirectory config is required; Docker builds from repository root.
- The Docker image runs as a non-root user and starts with `node server.js`.
- Vercel git auto-deploys are explicitly disabled in `vercel.json` (`git.deploymentEnabled=false`).

### Deploy Automation (GitHub Actions -> Coolify)

Workflow: `.github/workflows/deploy-coolify.yml`

- Auto deploy trigger: after `CI` succeeds on `push` to `master`.
- Manual deploy trigger: GitHub Actions `workflow_dispatch`.

Required GitHub repository secrets:

- `COOLIFY_DEPLOY_WEBHOOK` (required): Coolify deploy webhook URL.
- `COOLIFY_DEPLOY_TOKEN` (optional): bearer token added as `Authorization: Bearer <token>`.
