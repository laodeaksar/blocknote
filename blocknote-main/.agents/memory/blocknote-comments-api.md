---
name: BlockNote comments API (v0.51.4)
description: How to wire up the CommentsExtension in BlockNote with a custom ThreadStore
---

`CommentsExtension` is a function (not a class) exported from `@blocknote/core/comments`:
```ts
CommentsExtension({ threadStore, resolveUsers, schema? }) // returns ExtensionFactoryInstance
```

Passed via `editorOptions.extensions: [CommentsExtension({...})]` in `useBlockNoteSync`.

`ThreadStore` is an abstract class. Extend it with a custom class, pass `DefaultThreadStoreAuth(userId, "editor")` to super().

UI components from `@blocknote/react` (NOT `@blocknote/shadcn`):
- `FloatingComposerController` — floating composer popup; goes inside `<BlockNoteView>`
- `FloatingThreadController` — floating thread viewer; goes inside `<BlockNoteView>`
- `AddCommentButton` — toolbar button; goes inside `<FormattingToolbar>`

`FormattingToolbar` and `FormattingToolbarController` must also be imported from `@blocknote/react` (shadcn re-exports them at runtime but `.d.ts` types don't include them).

**Why:** Had to trace type declarations in `node_modules/@blocknote/react/types/src/index.d.ts` to confirm the correct import paths.

User type: `{ id: string, username: string, avatarUrl: string }` (avatarUrl is required, not optional).
