---
name: BlockNote TipTap internals
description: How to access ProseMirror/TipTap APIs from a BlockNote editor instance for custom plugins and event handling.
---

## Rule
Access the underlying TipTap editor via `(editor as any)._tiptapEditor`. This is a private field but is stable across BlockNote 0.23.x.

**Why:** BlockNote does not expose a public API for raw TipTap/ProseMirror access. The `_tiptapEditor` field is used internally (seen in `src-B6rlChSc.cjs`) and gives access to:
- `tiptap.registerPlugin(plugin)` — add a ProseMirror plugin after editor creation
- `tiptap.on('selectionUpdate', handler)` / `tiptap.off(...)` — TipTap event bus
- `tiptap.on('update', handler)` — document change events
- `tiptap.view` — the live ProseMirror `EditorView`
- `tiptap.view.state` / `tiptap.view.dispatch(tr)` — ProseMirror state and dispatch

BlockNote also exposes higher-level accessors:
- `editor.prosemirrorView` — same as `_tiptapEditor.view`
- `editor.prosemirrorState` — current ProseMirror state

**How to apply:** Use when adding dynamic ProseMirror plugins (e.g. cursor decorations) or subscribing to raw selection/update events outside of React component context.
