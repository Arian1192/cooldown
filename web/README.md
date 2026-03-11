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
npm run lint # eslint + `eslint-config-next` (core-web-vitals)
npm run typecheck # dedicated TypeScript validation (`tsc --noEmit`)
npm run test # Vitest unit + route smoke tests
npm run build # `next build`
```

Quality references:
- Accessibility baseline: `ACCESSIBILITY.md`
- Performance budget: `PERFORMANCE.md`

## Environment variables

- **Server-only:** regular vars (e.g. `STRAPI_URL`) – never prefix with `NEXT_PUBLIC_`.
- **Client-exposed:** must be prefixed with `NEXT_PUBLIC_` (anything else is not accessible in the browser).

Current keys used by web:

- `NEXT_PUBLIC_SITE_NAME` (optional, default `Music + Urban`)
- `SITE_URL` (optional in Vercel, recommended in production for canonical URLs)
- `STRAPI_URL` (recommended; CMS API base URL)
- `CMS_BASE_URL` (legacy alias for `STRAPI_URL`, still accepted)
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` (optional analytics)
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (optional analytics)

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
