import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  from: number;
  to: number;
}

export const remoteCursorsKey = new PluginKey<Map<string, RemoteCursor>>(
  "remoteCursors"
);

function createCursorWidget(cursor: RemoteCursor): HTMLElement {
  const wrap = document.createElement("span");
  wrap.style.cssText = `
    position: relative;
    display: inline-block;
    border-left: 2px solid ${cursor.color};
    margin-left: -1px;
    pointer-events: none;
    vertical-align: text-bottom;
    height: 1.2em;
  `;

  const label = document.createElement("div");
  label.textContent =
    cursor.userName.split(" ").slice(0, 2).join(" ") || "Anonymous";
  label.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    background: ${cursor.color};
    color: #fff;
    font-size: 11px;
    font-family: sans-serif;
    font-weight: 600;
    line-height: 1;
    padding: 2px 6px 3px;
    border-radius: 3px 3px 3px 0;
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
  `;
  wrap.appendChild(label);
  return wrap;
}

export function createCursorPlugin(): Plugin<Map<string, RemoteCursor>> {
  return new Plugin({
    key: remoteCursorsKey,
    state: {
      init: () => new Map<string, RemoteCursor>(),
      apply(tr, cursors) {
        const meta = tr.getMeta(remoteCursorsKey);
        if (meta !== undefined) return meta as Map<string, RemoteCursor>;
        return cursors;
      },
    },
    props: {
      decorations(state) {
        const cursors = remoteCursorsKey.getState(state);
        if (!cursors || cursors.size === 0) return DecorationSet.empty;

        const docSize = state.doc.content.size;
        const decos: Decoration[] = [];

        for (const [key, cursor] of cursors.entries()) {
          const pos = Math.min(Math.max(cursor.from, 1), docSize - 1);
          if (pos < 1) continue;

          try {
            decos.push(
              Decoration.widget(pos, () => createCursorWidget(cursor), {
                key,
                side: 1,
              })
            );
          } catch {
            // skip invalid positions
          }
        }

        return DecorationSet.create(state.doc, decos);
      },
    },
  });
}
