---
name: Convex schema deployment
description: How Convex schema/index deployment works in Replit and how to work around missing indexes
---

Without a CONVEX_DEPLOY_KEY, schema changes can't be pushed to the cloud deployment. Running `npx convex dev --once` creates a LOCAL deployment at 127.0.0.1:3210 and writes .env.local, which overrides cloud secrets — delete .env.local immediately after.

**Why:** Convex requires indexes to be deployed before `.withIndex()` queries work. On the cloud, if schema hasn't been pushed, `.withIndex()` throws "Unknown index" at runtime.

**How to apply:** When adding new Convex tables that need to work immediately without schema push, use `.filter((q) => q.eq(q.field("fieldName"), value))` instead of `.withIndex("indexName", ...)`. Tables are created implicitly on first insert, but indexes require schema deployment.

Also: the generated `convex/_generated/api.d.ts` must be manually updated to include new modules when `npx convex codegen` can't run (no CONVEX_DEPLOYMENT set).
