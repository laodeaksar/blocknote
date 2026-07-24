---
name: Imported Convex generated files
description: Imported Convex projects may omit deployment-generated client/server files, preventing Next.js routes from compiling.
---

Imported Convex repositories can fail before any UI interaction when `convex/_generated` is absent. The app needs generated API, data model, and server type modules available at build time; regenerate them after linking a deployment, or keep a local permissive substitute only as a temporary build bridge.

**Why:** The generated directory is often ignored by Git, while the imported repository may not include the files required by its Next.js imports.

**How to apply:** Check `convex/_generated` before debugging page-level UI errors. Also verify the active Node version before invoking a project-local pnpm dependency; pnpm 11 requires Node 22+, while the Replit module may still provide Node 20.