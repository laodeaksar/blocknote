"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Copy,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Trash2,
  Type,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BlockInfo {
  dom: HTMLElement;
  rect: DOMRect;
  pmPos: number;
}

interface BlockDragHandleProps {
  editor: Editor;
}

const TURN_INTO_ITEMS = [
  { label: "Teks", icon: Type, command: (e: Editor) => e.chain().focus().setParagraph().run() },
  { label: "Heading 1", icon: Heading1, command: (e: Editor) => e.chain().focus().setHeading({ level: 1 }).run() },
  { label: "Heading 2", icon: Heading2, command: (e: Editor) => e.chain().focus().setHeading({ level: 2 }).run() },
  { label: "Heading 3", icon: Heading3, command: (e: Editor) => e.chain().focus().setHeading({ level: 3 }).run() },
  { label: "Bullet List", icon: List, command: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { label: "Numbered List", icon: ListOrdered, command: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { label: "Task List", icon: CheckSquare, command: (e: Editor) => e.chain().focus().toggleTaskList().run() },
  { label: "Kutipan", icon: Quote, command: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { label: "Kode", icon: Code, command: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
];

function resolveBlock(editor: Editor, pmPos: number) {
  try {
    const { state } = editor.view;
    const resolved = state.doc.resolve(pmPos);
    const depth = resolved.depth > 0 ? resolved.depth - 1 : 0;
    const from = resolved.before(depth + 1);
    const node = state.doc.nodeAt(from);
    if (!node) return null;
    return { from, to: from + node.nodeSize, node };
  } catch {
    return null;
  }
}

export function BlockDragHandle({ editor }: BlockDragHandleProps) {
  const [block, setBlock] = useState<BlockInfo | null>(null);
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDragging = useRef(false);
  const isTouchActive = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const clearHide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  }, []);

  const scheduleHide = useCallback((delay = 400) => {
    clearHide();
    hideTimer.current = setTimeout(() => setBlock(null), delay);
  }, [clearHide]);

  const resolveBlockFromPoint = useCallback((clientX: number, clientY: number) => {
    const editorDom = editor.view.dom as HTMLElement;
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    let node: Element | null = el;
    while (node && node.parentElement !== editorDom) {
      node = node.parentElement;
    }
    if (!node || !(node instanceof HTMLElement)) return null;
    try {
      const pmPos = editor.view.posAtDOM(node, 0);
      return { dom: node, rect: node.getBoundingClientRect(), pmPos };
    } catch {
      return null;
    }
  }, [editor]);

  useEffect(() => {
    const editorDom = editor.view.dom as HTMLElement;
    const container = editorDom.closest<HTMLElement>(".tiptap-editor");
    if (!container) return;

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging.current || open || isTouchActive.current) return;
      clearHide();
      const info = resolveBlockFromPoint(e.clientX, e.clientY);
      if (info) setBlock(info);
      else scheduleHide();
    };

    const onMouseLeave = (e: MouseEvent) => {
      if (open || isTouchActive.current) return;
      const related = e.relatedTarget as Node | null;
      if (triggerRef.current?.contains(related)) return;
      scheduleHide();
    };

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      isTouchActive.current = true;
      clearHide();
      const info = resolveBlockFromPoint(touch.clientX, touch.clientY);
      if (info) {
        setBlock(info);
        scheduleHide(4000);
      }
    };

    const onTouchEnd = () => {
      setTimeout(() => { isTouchActive.current = false; }, 300);
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
      clearHide();
    };
  }, [editor, open, clearHide, scheduleHide, resolveBlockFromPoint]);

  const focusBlock = useCallback(() => {
    if (!block) return;
    try {
      const { state } = editor.view;
      const resolved = state.doc.resolve(block.pmPos);
      const depth = resolved.depth > 0 ? resolved.depth - 1 : 0;
      const from = resolved.before(depth + 1);
      const node = state.doc.nodeAt(from);
      if (!node) return;
      editor.view.dispatch(
        state.tr.setSelection(NodeSelection.create(state.doc, from))
      );
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  const handleInsertAbove = useCallback(() => {
    if (!block) return;
    try {
      const { state, dispatch } = editor.view;
      const resolved = state.doc.resolve(block.pmPos);
      const depth = resolved.depth > 0 ? resolved.depth - 1 : 0;
      const from = resolved.before(depth + 1);
      const para = state.schema.nodes.paragraph?.createAndFill();
      if (!para) return;
      dispatch(state.tr.insert(from, para));
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  const handleInsertBelow = useCallback(() => {
    if (!block) return;
    const info = resolveBlock(editor, block.pmPos);
    if (!info) return;
    try {
      const { state, dispatch } = editor.view;
      const para = state.schema.nodes.paragraph?.createAndFill();
      if (!para) return;
      dispatch(state.tr.insert(info.to, para));
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  const handleDuplicate = useCallback(() => {
    if (!block) return;
    const info = resolveBlock(editor, block.pmPos);
    if (!info) return;
    try {
      const { state, dispatch } = editor.view;
      dispatch(state.tr.insert(info.to, info.node));
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  const handleMoveUp = useCallback(() => {
    if (!block) return;
    const info = resolveBlock(editor, block.pmPos);
    if (!info || info.from === 0) return;
    try {
      const { state, dispatch } = editor.view;
      const prevResolved = state.doc.resolve(info.from - 1);
      const prevFrom = prevResolved.before(prevResolved.depth);
      const tr = state.tr;
      tr.delete(info.from, info.to);
      tr.insert(prevFrom, info.node);
      dispatch(tr);
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  const handleMoveDown = useCallback(() => {
    if (!block) return;
    const info = resolveBlock(editor, block.pmPos);
    if (!info) return;
    try {
      const { state, dispatch } = editor.view;
      const nextNode = state.doc.nodeAt(info.to);
      if (!nextNode) return;
      const tr = state.tr;
      tr.insert(info.to + nextNode.nodeSize, info.node);
      tr.delete(info.from, info.to);
      dispatch(tr);
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  const handleDelete = useCallback(() => {
    if (!block) return;
    const info = resolveBlock(editor, block.pmPos);
    if (!info) return;
    try {
      const { state, dispatch } = editor.view;
      dispatch(state.tr.delete(info.from, info.to));
      editor.view.focus();
    } catch {}
  }, [editor, block]);

  if (!block) return null;

  const top = block.rect.top + block.rect.height / 2 - 12;
  const left = block.rect.left - 30;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        ref={triggerRef}
        data-block-drag-handle=""
        draggable
        onMouseEnter={clearHide}
        onMouseLeave={() => { if (!open) scheduleHide(); }}
        onMouseDown={(e) => { e.preventDefault(); focusBlock(); }}
        onTouchStart={(e) => { clearHide(); focusBlock(); }}
        onDragStart={(e) => {
          isDragging.current = true;
          focusBlock();
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragEnd={() => { isDragging.current = false; }}
        style={{ position: "fixed", top, left, zIndex: 50 }}
        className="flex size-7 md:size-6 items-center justify-center rounded hover:bg-accent hover:text-accent-foreground transition-colors cursor-grab active:cursor-grabbing touch-manipulation"
        title="Geser atau klik untuk opsi"
      >
        <GripVertical className="size-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent side="right" align="start" sideOffset={4} className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xxs uppercase tracking-wide">
            Blok
          </DropdownMenuLabel>

          <DropdownMenuItem onSelect={handleInsertAbove}>
            <ArrowUp data-icon="inline-start" />
            Sisipkan di atas
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleInsertBelow}>
            <ArrowDown data-icon="inline-start" />
            Sisipkan di bawah
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleMoveUp}>
            <ArrowUp data-icon="inline-start" />
            Pindah ke atas
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleMoveDown}>
            <ArrowDown data-icon="inline-start" />
            Pindah ke bawah
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={handleDuplicate}>
            <Copy data-icon="inline-start" />
            Duplikat
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Type data-icon="inline-start" />
              Ubah jadi
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {TURN_INTO_ITEMS.map(({ label, icon: Icon, command }) => (
                <DropdownMenuItem
                  key={label}
                  onSelect={() => {
                    focusBlock();
                    command(editor);
                  }}
                >
                  <Icon />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onSelect={handleDelete}>
          <Trash2 data-icon="inline-start" />
          Hapus blok
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
