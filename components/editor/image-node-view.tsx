"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize2,
  Trash2,
} from "lucide-react";

const MIN_WIDTH = 64;

type ImageAlign = "left" | "center" | "right";

function parseWidthFromStyle(style: string | null): number | null {
  if (!style) return null;
  const match = style.match(/width:\s*([\d.]+)(?:px|%)/);
  if (!match) return null;
  if (style.includes("%")) return null;
  return parseFloat(match[1]);
}

const ALIGN_BUTTONS: { value: ImageAlign; icon: React.ReactNode; label: string }[] = [
  { value: "left", icon: <AlignLeft className="size-3.5" />, label: "Rata kiri" },
  { value: "center", icon: <AlignCenter className="size-3.5" />, label: "Rata tengah" },
  { value: "right", icon: <AlignRight className="size-3.5" />, label: "Rata kanan" },
];

export function ImageNodeView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    style?: string | null;
    align?: ImageAlign;
  };
  const { src, alt, title, style, align = "left" } = attrs;

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const liveWidthRef = useRef<number | null>(parseWidthFromStyle(style ?? null));
  const [liveWidth, setLiveWidth] = useState<number | null>(liveWidthRef.current);
  const [isResizing, setIsResizing] = useState(false);
  const isFullWidth = style?.includes("%") ?? false;

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = containerRef.current?.offsetWidth ?? 300;
      setIsResizing(true);

      const onMouseMove = (ev: MouseEvent) => {
        const newWidth = Math.max(MIN_WIDTH, startWidth + (ev.clientX - startX));
        liveWidthRef.current = newWidth;
        setLiveWidth(newWidth);
      };

      const onMouseUp = () => {
        setIsResizing(false);
        updateAttributes({ style: `width: ${liveWidthRef.current ?? startWidth}px` });
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  const setFullWidth = useCallback(() => {
    liveWidthRef.current = null;
    setLiveWidth(null);
    updateAttributes({ style: "width: 100%", align: "left" });
  }, [updateAttributes]);

  const containerStyle: React.CSSProperties = isFullWidth
    ? { width: "100%" }
    : liveWidth
    ? { width: `${liveWidth}px`, maxWidth: "100%" }
    : { maxWidth: "100%" };

  const containerAlignClass = cn(
    "relative",
    !isFullWidth && align === "center" && "mx-auto",
    !isFullWidth && align === "right" && "ml-auto",
    !isFullWidth && align === "left" && "mr-auto"
  );

  return (
    <NodeViewWrapper as="figure" className="block w-full my-2 not-prose">
      <div ref={containerRef} className={containerAlignClass} style={containerStyle}>
        {/* Floating toolbar */}
        {selected && (
          <div
            className="absolute -top-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 rounded-lg border border-border bg-background px-1 py-0.5 shadow-lg ring-1 ring-foreground/5 whitespace-nowrap"
            onMouseDown={(e) => e.preventDefault()}
          >
            {ALIGN_BUTTONS.map(({ value, icon, label }) => (
              <button
                key={value}
                type="button"
                title={label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  updateAttributes({ align: value });
                }}
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors",
                  align === value && !isFullWidth
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {icon}
              </button>
            ))}

            <div className="mx-0.5 h-4 w-px bg-border" />

            <button
              type="button"
              title="Lebar penuh"
              onMouseDown={(e) => {
                e.preventDefault();
                setFullWidth();
              }}
              className={cn(
                "flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors",
                isFullWidth
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Maximize2 className="size-3.5" />
            </button>

            <div className="mx-0.5 h-4 w-px bg-border" />

            <button
              type="button"
              title="Hapus gambar"
              onMouseDown={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              className="flex items-center justify-center w-7 h-7 rounded-md text-sm transition-colors text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}

        {/* Image */}
        <img
          ref={imgRef}
          src={src}
          alt={alt ?? ""}
          title={title ?? ""}
          draggable={false}
          className={cn(
            "block w-full rounded-sm select-none",
            selected && "ring-2 ring-primary ring-offset-2",
            isResizing && "pointer-events-none"
          )}
        />

        {/* Resize handles */}
        {selected && !isFullWidth && (
          <>
            <span
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 z-10 w-2.5 h-8 rounded-full bg-primary shadow-md cursor-ew-resize opacity-90 hover:opacity-100"
              onMouseDown={startResize}
            />
            <span
              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 z-10 w-3 h-3 rounded-full bg-primary shadow-md cursor-nwse-resize opacity-90 hover:opacity-100"
              onMouseDown={startResize}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
