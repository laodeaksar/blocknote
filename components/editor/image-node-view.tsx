"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

const MIN_WIDTH = 64;

function parseWidthFromStyle(style: string | null): number | null {
  if (!style) return null;
  const match = style.match(/width:\s*([\d.]+)px/);
  return match ? parseFloat(match[1]) : null;
}

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, alt, title, style } = node.attrs as {
    src: string;
    alt?: string;
    title?: string;
    style?: string | null;
  };

  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [liveWidth, setLiveWidth] = useState<number | null>(
    parseWidthFromStyle(style ?? null)
  );

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = imgRef.current?.offsetWidth ?? 300;
      setIsResizing(true);

      const onMouseMove = (ev: MouseEvent) => {
        const delta = ev.clientX - startX;
        setLiveWidth(Math.max(MIN_WIDTH, startWidth + delta));
      };

      const onMouseUp = () => {
        setIsResizing(false);
        const finalWidth = imgRef.current?.offsetWidth ?? startWidth;
        updateAttributes({ style: `width: ${finalWidth}px` });
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [updateAttributes]
  );

  const currentWidth = liveWidth ?? undefined;

  return (
    <NodeViewWrapper
      as="span"
      className="inline-block relative max-w-full"
      data-drag-handle
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt ?? ""}
        title={title ?? ""}
        draggable={false}
        className={cn(
          "tiptap-image block max-w-full rounded-sm select-none",
          selected && "ring-2 ring-primary ring-offset-2",
          isResizing && "pointer-events-none"
        )}
        style={{ width: currentWidth ? `${currentWidth}px` : undefined }}
      />

      {selected && (
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
    </NodeViewWrapper>
  );
}
