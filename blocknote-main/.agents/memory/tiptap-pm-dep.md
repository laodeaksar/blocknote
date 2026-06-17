---
name: @tiptap/pm direct dependency
description: @tiptap/pm must be a direct project dependency for TypeScript module resolution even though it is already a transitive dep of @blocknote packages.
---

## Rule
Run `pnpm add @tiptap/pm` when any file imports from `@tiptap/pm/state`, `@tiptap/pm/view`, etc.

**Why:** pnpm strict hoisting means transitive packages are NOT accessible from root `node_modules`. `@tiptap/pm` is a peer/transitive dep of `@blocknote/*` packages but lives only in the `.pnpm` virtual store. TypeScript cannot resolve it until it is a direct dependency.

**How to apply:** Whenever `lib/` or `components/` files need ProseMirror types (`Plugin`, `PluginKey`, `Decoration`, `DecorationSet`, `Transaction`, `EditorView`), add `@tiptap/pm` as a direct dep first. Adding it takes ~7s with pnpm.
