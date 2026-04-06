# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Turbopack, default)
npm run build    # Production build (Turbopack, default)
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Stack

- **Next.js 16.2.2** — App Router, Turbopack by default
- **React 19.2.4** — with React Compiler support (stable, opt-in via `reactCompiler: true` in `next.config.ts`)
- **TypeScript 5**, **Tailwind CSS v4**, **shadcn/radix-ui**, **lucide-react**

## Next.js 16 Breaking Changes

This project uses Next.js 16, which has significant breaking changes from earlier versions. **Always read `node_modules/next/dist/docs/` before writing code** (per AGENTS.md).

Key changes to be aware of:

### Async Request APIs (fully removed sync access)
`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now async-only — no synchronous fallback:

```tsx
// Correct in Next.js 16
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, `RouteContext` type helpers.

### `middleware` → `proxy`
The `middleware.ts` convention is deprecated. Use `proxy.ts` with `export function proxy(request: Request) {}`. The `edge` runtime is NOT supported in `proxy` — use `nodejs` only.

### Linting
`next build` no longer runs the linter automatically. Run `npm run lint` separately. ESLint config is in `eslint.config.mjs` (flat config format).

### Caching APIs
`unstable_cacheLife` and `unstable_cacheTag` are now stable — import as `cacheLife` and `cacheTag` from `next/cache`. New APIs: `updateTag` (read-your-writes semantics), `refresh` (refresh client router from Server Actions).

### PPR
`experimental.ppr` is removed. Use `cacheComponents: true` in `next.config.ts` instead.

### Turbopack config
`experimental.turbopack` is now top-level `turbopack` in `next.config.ts`.

## Architecture

App Router layout — all routes live under `app/`. Server Components by default; add `'use client'` only when you need interactivity, browser APIs, or hooks.

```
app/
  layout.tsx   # Root layout (Geist font, html/body)
  page.tsx     # Home page (/)
  globals.css  # Tailwind v4 global styles
public/        # Static assets (served from /)
```
