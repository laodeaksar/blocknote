"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import {
  GripVertical,
  Trash2,
  Copy,
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Code2,
  Quote,
} from "lucide-react";

interface HandleState {
  top: number;
  left: number;
  height: number;
  nodePos: number;
}

interface MenuState {
  x: number;
  y: number;
  nodePos: number;
}

const BLOCK_SELECTOR =
  'p, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre, hr, [data-type="taskList"], [data-type="taskItem"]';

const TURN_INTO_OPTIONS = [
  { label: "Paragraf", icon: Pilcrow, type: "paragraph", attrs: undefined },
  { label: "Judul 1", icon: Heading1, type: "heading", attrs: { level: 1 as const } },
  { label: "Judul 2", icon: Heading2, type: "heading", attrs: { level: 2 as const } },
  { label: "Judul 3", icon: Heading3, type: "heading", attrs: { level: 3 as const } },
  { label: "Daftar Bullet", icon: List, type: "bulletList", attrs: undefined },
  { label: "Daftar Angka", icon: ListOrdered, type: "orderedList", attrs: undefined },
  { label: "Daftar Tugas", icon: ListTodo, type: "taskList", attrs: undefined },
  { label: "Blok Kode", icon: Code2, type: "codeBlock", attrs: undefined },
  { label: "Kutipan", icon: Quote, type: "blockquote", attrs: undefined },
] as const;

export function BlockDragHandle({ editor }: { editor: Editor }) {
  const [handle, setHandle] = useState<HandleState | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [mounted, setMounted] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const view = editor.view;
    const editorEl = view.dom as HTMLElement;

    const scheduleHide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setHandle(null), 350);
    };

    const cancelHide = () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (menu) return;

      const target = e.target as HTMLElement;
      const block = target.closest<HTMLElement>(BLOCK_SELECTOR);
      if (!block || !editorEl.contains(block)) {
        scheduleHide();
        return;
      }

      cancelHide();

      const blockRect = block.getBoundingClientRect();
      const editorRect = editorEl.getBoundingClientRect();

      let nodePos = 0;
      try {
        const pmPos = view.posAtCoords({
          left: blockRect.left + 2,
          top: blockRect.top + blockRect.height / 2,
        });
        if (pmPos) {
          const resolved = view.state.doc.resolve(pmPos.pos);
          nodePos = resolved.depth > 0 ? resolved.before(Math.min(1, resolved.depth)) : pmPos.pos;
        }
      } catch {
        // ignore
      }

      setHandle({
        top: blockRect.top,
        left: editorRect.left,
        height: blockRect.height,
        nodePos,
      });
    };

    const onMouseLeave = () => {
      if (!menu) scheduleHide();
    };

    editorEl.addEventListener("mousemove", onMouseMove);
    editorEl.addEventListener("mouseleave", onMouseLeave);

    return () => {
      editorEl.removeEventListener("mousemove", onMouseMove);
      editorEl.removeEventListener("mouseleave", onMouseLeave);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [editor, menu]);

  useEffect(() => {
    if (!menu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-block-context-menu]")) {
        setMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menu]);

  const openMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!handle) return;
    const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setMenu({ x: btnRect.right + 4, y: btnRect.top, nodePos: handle.nodePos });
  };

  const closeMenu = () => {
    setMenu(null);
    setHandle(null);
  };

  const deleteBlock = () => {
    if (!menu) return;
    const { state, dispatch } = editor.view;
    const node = state.doc.nodeAt(menu.nodePos);
    if (!node) return;
    dispatch(state.tr.delete(menu.nodePos, menu.nodePos + node.nodeSize));
    closeMenu();
  };

  const duplicateBlock = () => {
    if (!menu) return;
    const { state, dispatch } = editor.view;
    const node = state.doc.nodeAt(menu.nodePos);
    if (!node) return;
    dispatch(state.tr.insert(menu.nodePos + node.nodeSize, node.copy(node.content)));
    closeMenu();
  };

  const turnInto = (type: string, attrs?: { level?: 1 | 2 | 3 }) => {
    if (!menu) return;
    const pos = menu.nodePos + 1;
    editor.chain().focus().setTextSelection(pos).run();
    if (type === "paragraph") editor.commands.setParagraph();
    else if (type === "heading") editor.commands.setHeading({ level: attrs?.level ?? 1 });
    else if (type === "bulletList") editor.commands.toggleBulletList();
    else if (type === "orderedList") editor.commands.toggleOrderedList();
    else if (type === "taskList") editor.commands.toggleTaskList();
    else if (type === "codeBlock") editor.commands.toggleCodeBlock();
    else if (type === "blockquote") editor.commands.toggleBlockquote();
    closeMenu();
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {handle && (
        <div
          data-block-context-menu
          style={{
            position: "fixed",
            top: handle.top + handle.height / 2 - 12,
            left: handle.left - 32,
            zIndex: 50,
          }}
          onMouseEnter={() => {
            if (hideTimer.current) clearTimeout(hideTimer.current);
          }}
          onMouseLeave={() => {
            if (!menu) {
              if (hideTimer.current) clearTimeout(hideTimer.current);
              hideTimer.current = setTimeout(() => setHandle(null), 350);
            }
          }}
        >
          <button
            type="button"
            onMouseDown={openMenu}
            title="Opsi blok"
            className="flex items-center justify-center w-6 h-6 rounded text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent transition-colors cursor-pointer select-none"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </div>
      )}

      {menu && (
        <div
          data-block-context-menu
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            zIndex: 9999,
          }}
          className="w-52 rounded-xl border border-border bg-background shadow-xl py-1 text-sm select-none"
        >
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              deleteBlock();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            Hapus blok
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              duplicateBlock();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-accent text-foreground transition-colors"
          >
            <Copy className="w-3.5 h-3.5 shrink-0" />
            Duplikat blok
          </button>
          <div className="h-px bg-border my-1" />
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Ubah menjadi
          </div>
          {TURN_INTO_OPTIONS.map((item) => (
            <button
              key={`${item.type}-${item.attrs?.level ?? ""}`}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                turnInto(item.type, item.attrs);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-accent text-foreground transition-colors"
            >
              <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>,
    document.body
  );
}
