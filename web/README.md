# web/ (Next.js baseline)

## Requirements

- Node: see `../.nvmrc` (CI uses Node 22)
- Install uses **npm** with a committed `package-lock.json` (reproducible via `npm ci`)
- npm version is pinned by `packageManager` in `package.json` (`npm@10.9.4`)
- `engine-strict=true` in `.npmrc` blocks mismatched Node/npm versions

## Local dev

```bash
npm run check:toolchain
npm ci
npm run dev
```

## Checks

```bash
npm run lint  # eslint + `eslint-config-next` (core-web-vitals)
npm run build # `next build`
```

## Environment variables

- **Server-only:** regular vars (e.g. `CMS_BASE_URL`) – never prefix with `NEXT_PUBLIC_`.
- **Client-exposed:** must be prefixed with `NEXT_PUBLIC_` (anything else is not accessible in the browser).

Example file: `.env.example`

Code convention: `src/env.ts` (central place for safe reads / defaults).

Content source flags:
- `CONTENT_SOURCE=versioned-json|remote-json|strapi`
- `CONTENT_JSON_URL` required for `remote-json`
- `CONTENT_ENABLE_SEED_FALLBACK=true|false` to control development fallback when source is unavailable
- Default behavior: `CONTENT_SOURCE=strapi` and `STRAPI_URL=https://cms-cooldown-roan.ariancoro.com` (weekly feed endpoint)

## Deploy (Vercel)

Vercel monorepo config:
- Root Directory: `web`
- Build: `next build`
- Output: `.next`
