"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  FloatingPortal,
  type VirtualElement,
} from "@floating-ui/react";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Type,
  Image,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";

export interface SlashMenuItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  group: string;
  command: (editor: Editor) => void;
}

export const SLASH_ITEMS: SlashMenuItem[] = [
  {
    group: "Teks Dasar",
    title: "Teks",
    description: "Paragraf teks biasa",
    icon: <Type />,
    command: (editor) =>
      editor.chain().focus().setParagraph().run(),
  },
  {
    group: "Teks Dasar",
    title: "Heading 1",
    description: "Judul besar",
    icon: <Heading1 />,
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    group: "Teks Dasar",
    title: "Heading 2",
    description: "Judul medium",
    icon: <Heading2 />,
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    group: "Teks Dasar",
    title: "Heading 3",
    description: "Judul kecil",
    icon: <Heading3 />,
    command: (editor) =>
      editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    group: "List",
    title: "Bullet List",
    description: "Daftar tidak berurutan",
    icon: <List />,
    command: (editor) =>
      editor.chain().focus().toggleBulletList().run(),
  },
  {
    group: "List",
    title: "Numbered List",
    description: "Daftar berurutan",
    icon: <ListOrdered />,
    command: (editor) =>
      editor.chain().focus().toggleOrderedList().run(),
  },
  {
    group: "List",
    title: "Task List",
    description: "Daftar tugas dengan centang",
    icon: <CheckSquare />,
    command: (editor) =>
      editor.chain().focus().toggleTaskList().run(),
  },
  {
    group: "Blok",
    title: "Kutipan",
    description: "Blok kutipan teks",
    icon: <Quote />,
    command: (editor) =>
      editor.chain().focus().toggleBlockquote().run(),
  },
  {
    group: "Blok",
    title: "Kode",
    description: "Blok kode dengan syntax",
    icon: <Code />,
    command: (editor) =>
      editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    group: "Blok",
    title: "Pemisah",
    description: "Garis horizontal pemisah",
    icon: <Minus />,
    command: (editor) =>
      editor.chain().focus().setHorizontalRule().run(),
  },
  {
    group: "Media",
    title: "Upload Gambar",
    description: "Unggah gambar dari perangkat",
    icon: <Image />,
    command: (editor) => {
      editor.commands.uploadImage();
    },
  },
];

export interface SlashMenuRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

interface SlashMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  clientRect?: (() => DOMRect | null) | null;
  editor: Editor;
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  function SlashMenu({ items, command, clientRect }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    const { refs, floatingStyles } = useFloating({
      placement: "bottom-start",
      middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
      strategy: "fixed",
    });

    useEffect(() => {
      if (!clientRect) return;
      const rect = clientRect();
      if (!rect) return;
      const virtualEl: VirtualElement = { getBoundingClientRect: () => rect };
      refs.setPositionReference(virtualEl);
    }, [clientRect, refs]);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useEffect(() => {
      const el = listRef.current?.querySelector(
        `[data-slash-index="${selectedIndex}"]`
      ) as HTMLElement | null;
      el?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowUp") {
          setSelectedIndex((i) => (i - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((i) => (i + 1) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }));

    if (items.length === 0) return null;

    const groups = Array.from(new Set(items.map((i) => i.group)));

    let flatIndex = 0;

    return (
      <FloatingPortal>
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          className="z-[9999] w-64 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl ring-1 ring-foreground/5 animate-in fade-in-0 zoom-in-95 duration-100 overflow-hidden"
        >
          <div className="p-1 max-h-80 overflow-y-auto" ref={listRef}>
            {groups.map((group, gi) => {
              const groupItems = items.filter((i) => i.group === group);
              return (
                <div key={group}>
                  {gi > 0 && <ItemSeparator className="my-0.5" />}
                  <div className="px-2 py-1 text-xxs font-semibold uppercase tracking-wider text-muted-foreground/60 select-none">
                    {group}
                  </div>
                  <ItemGroup>
                    {groupItems.map((item) => {
                      const idx = flatIndex++;
                      const isActive = selectedIndex === idx;
                      return (
                        <Item
                          key={item.title}
                          data-slash-index={idx}
                          role="option"
                          aria-selected={isActive}
                          className="cursor-pointer gap-2.5 px-2 py-1.5"
                          variant={isActive ? "muted" : undefined}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            command(item);
                          }}
                        >
                          <ItemMedia variant="icon" size="md" className="border border-border bg-muted text-muted-foreground">
                            {item.icon}
                          </ItemMedia>
                          <ItemContent>
                            <ItemTitle className="text-xs font-medium">
                              {item.title}
                            </ItemTitle>
                            <ItemDescription className="text-xxs leading-tight">
                              {item.description}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      );
                    })}
                  </ItemGroup>
                </div>
              );
            })}
          </div>
        </div>
      </FloatingPortal>
    );
  }
);
