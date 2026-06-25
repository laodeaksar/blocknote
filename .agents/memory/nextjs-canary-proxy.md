---
name: Next.js Canary proxy middleware
description: Next.js v16 canary replaces middleware.ts with proxy.ts; having both causes a fatal unhandled rejection on every request.
---

**Rule:** In Next.js Canary (v16+), the middleware file is `proxy.ts` at the project root, exporting `proxy` (not `middleware`) and `config`. Do NOT create `middleware.ts` alongside it.

**Why:** Next.js Canary introduced `proxy.ts` as a new middleware format. If both `middleware.ts` and `proxy.ts` exist, every request throws `unhandledRejection: Error: Both middleware file "./middleware.ts" and proxy file "./proxy.ts" are detected. Please use "./proxy.ts" only.` The app still compiles but logs are flooded with errors.

**How to apply:** When adding server-side route protection or request interception to this project, edit `proxy.ts` only. If `middleware.ts` was accidentally created, delete it with `rm middleware.ts` via bash (write tool alone cannot remove files).
