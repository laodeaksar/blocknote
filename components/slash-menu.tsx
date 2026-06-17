"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import type { Range } from "@tiptap/core";

export interface SlashMenuItem {
  group: string;
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
  clientRect?: (() => DOMRect | null) | null;
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(
  function SlashMenu({ items, command, clientRect }, ref) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useEffect(() => {
      if (!clientRect) return;
      const rect = clientRect();
      if (!rect) return;

      const menuHeight = 320;
      const menuWidth = 260;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = rect.bottom + 6;
      let left = rect.left;

      if (top + menuHeight > viewportHeight) {
        top = rect.top - menuHeight - 6;
      }
      if (left + menuWidth > viewportWidth) {
        left = viewportWidth - menuWidth - 8;
      }
      if (left < 8) left = 8;

      setPosition({ top, left });
    }, [clientRect]);

    useImperativeHandle(ref, () => ({
      onKeyDown({ event }: { event: KeyboardEvent }) {
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

    useEffect(() => {
      const el = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }, [selectedIndex]);

    if (!mounted || items.length === 0) return null;

    const groupMap = new Map<string, SlashMenuItem[]>();
    for (const item of items) {
      const group = groupMap.get(item.group) ?? [];
      group.push(item);
      groupMap.set(item.group, group);
    }

    const menu = (
      <div
        ref={menuRef}
        style={{
          position: "fixed",
          top: position.top,
          left: position.left,
          pointerEvents: "auto",
          zIndex: 9999,
        }}
        className="w-64 max-h-80 overflow-y-auto rounded-xl border border-border bg-background shadow-xl py-1"
      >
        {Array.from(groupMap.entries()).map(([group, groupItems]) => (
          <div key={group}>
            <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              {group}
            </div>
            {groupItems.map((item) => {
              const globalIdx = items.indexOf(item);
              return (
                <button
                  key={item.title}
                  data-index={globalIdx}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(globalIdx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    command(item);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                    globalIdx === selectedIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground hover:bg-accent/60"
                  }`}
                >
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md border border-border bg-background text-xs font-bold text-foreground">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-medium leading-tight">{item.title}</div>
                    <div className="text-xs text-muted-foreground leading-tight truncate">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );

    return createPortal(menu, document.body);
  }
);
