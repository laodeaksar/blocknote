---
name: Convex generated folder missing after import
description: convex/_generated is gitignored and absent after cloning/importing; how to regenerate without a deploy key
---

# Convex _generated folder missing after GitHub import

## The rule
When a Convex project is imported from GitHub, `convex/_generated/` is gitignored and absent. The app fails to compile, JS cannot hydrate, and any `disabled={!mounted}` button guard stays permanently disabled.

## Why
`npx convex codegen` requires a live Convex auth token (CONVEX_DEPLOY_KEY), but the "dynamic" generated files can be created manually from local source — they use `anyApi` + schema.ts directly.

## How to apply
Create three files in `convex/_generated/`:
- `api.ts` — import all convex module types, export `api`/`internal` via `anyApi`, `components` via `componentsGeneric()`
- `dataModel.ts` — use `DataModelFromSchemaDefinition<typeof schema>` (dynamic approach, no server analysis needed)
- `server.ts` — re-export generic builders (`queryGeneric`, `mutationGeneric`, etc.) typed with the DataModel

Do NOT use the "static" approach (which requires server analysis from a deployment).
