# web/ (Next.js baseline)

## Requirements

- Node: see `../.nvmrc` (CI uses Node 22)
- Install uses **npm** with a committed `package-lock.json` (reproducible via `npm ci`)

## Local dev

```bash
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

## Deploy (Vercel)

Vercel monorepo config:
- Root Directory: `web`
- Build: `next build`
- Output: `.next`
