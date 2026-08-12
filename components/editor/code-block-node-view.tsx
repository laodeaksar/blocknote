"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Copy, Check, WrapText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "plaintext", label: "Plain text" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "bash", label: "Bash / Shell" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "json", label: "JSON" },
  { value: "sql", label: "SQL" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "diff", label: "Diff" },
  { value: "graphql", label: "GraphQL" },
  { value: "lua", label: "Lua" },
  { value: "r", label: "R" },
  { value: "xml", label: "XML" },
];

export function CodeBlockNodeView({
  node,
  updateAttributes,
  selected,
}: NodeViewProps) {
  const language: string = node.attrs.language || "plaintext";
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [lineHeights, setLineHeights] = useState<number[]>([]);

  // Mengukur tinggi setiap elemen baris DOM yang dirender oleh TipTap/Highlight.js
  const updateLineHeights = useCallback(() => {
    if (!containerRef.current) return;

    // Ambil elemen editor di dalam NodeViewContent
    const codeContainer = containerRef.current.querySelector(".hljs") || containerRef.current.querySelector("code");
    
    if (!codeContainer) return;

    // Jika TipTap memisah per baris dengan tag div/p atau `\n`
    const lines = Array.from(codeContainer.childNodes);
    
    // Hitung tinggi berdasarkan karakter newline / pemisahan baris DOM
    const textContent = node.textContent || "";
    const lineCount = Math.max(1, textContent.split("\n").length);

    // Dapatkan computed line-height dari kontainer
    const computedStyle = window.getComputedStyle(codeContainer);
    const defaultLineHeight = parseFloat(computedStyle.lineHeight) || 24;

    // Jika tanpa wrap, semua baris berukuran standar
    if (!wrap) {
      setLineHeights(new Array(lineCount).fill(defaultLineHeight));
      return;
    }

    // Mengukur tinggi setiap baris secara akurat saat ter-wrap
    const heights: number[] = [];
    let currentHeight = 0;

    lines.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || "";
        const parts = text.split("\n");
        parts.forEach((_, idx) => {
          if (idx > 0) {
            heights.push(currentHeight || defaultLineHeight);
            currentHeight = 0;
          }
        });
      } else if (child instanceof HTMLElement) {
        const rect = child.getBoundingClientRect();
        currentHeight = Math.max(currentHeight, rect.height);
      }
    });

    // Masukkan sisa tinggi baris terakhir
    heights.push(currentHeight || defaultLineHeight);

    // Fallback jika kalkulasi DOM tidak seimbang dengan baris teks aktual
    while (heights.length < lineCount) {
      heights.push(defaultLineHeight);
    }

    setLineHeights(heights.slice(0, lineCount));
  }, [node.textContent, wrap]);

  // Sync ukuran saat mengetik (node.textContent berubah), toggle wrap, atau window resize
  useEffect(() => {
    updateLineHeights();

    const resizeObserver = new ResizeObserver(() => updateLineHeights());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [updateLineHeights]);

  const handleCopy = () => {
    const text = node.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <NodeViewWrapper
      className={cn(
        "code-block-wrapper not-prose relative my-4 rounded-lg overflow-hidden border border-border bg-muted",
        selected && "ring-2 ring-ring"
      )}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="code-block-header flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border select-none">
        <div className="flex gap-1.5 items-center">
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
          <span className="size-2.5 rounded-full bg-muted-foreground/40" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={wrap ? "secondary" : "ghost"}
            size="icon-xs"
            contentEditable={false}
            onClick={() => setWrap((v) => !v)}
            title={wrap ? "Nonaktifkan word wrap" : "Aktifkan word wrap"}
            className="text-[11px] cursor-pointer transition-colors"
          >
            <WrapText className="size-3" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            contentEditable={false}
            onClick={handleCopy}
            title="Salin kode"
            className="text-[11px] cursor-pointer transition-colors"
          >
            {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
          </Button>

          <div contentEditable={false}>
            <Select
              value={language}
              onValueChange={(val) => updateAttributes({ language: val })}
            >
              <SelectTrigger
                size="sm"
                className="w-fit h-auto gap-1 rounded border-0 bg-transparent px-1.5 py-0.5 text-[11px] font-mono cursor-pointer focus-visible:ring-0 focus-visible:border-transparent"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="font-mono">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value} className="text-xs font-mono">
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Body: Line numbers + Code ───────────────────────────────── */}
      <div ref={containerRef} className="flex bg-muted overflow-x-auto relative">
        {/* Line Numbers Bar */}
        <div
          contentEditable={false}
          aria-hidden="true"
          className="sticky left-0 z-10 select-none shrink-0 flex flex-col items-end py-4 px-3 bg-muted border-r border-border/60 text-muted-foreground font-mono text-xs"
        >
          {lineHeights.map((height, i) => (
            <span
              key={i}
              style={{ height: wrap ? `${height}px` : undefined }}
              className="tabular-nums leading-6 opacity-40 flex items-start justify-end"
            >
              {i + 1}
            </span>
          ))}
        </div>

        {/* Code Content */}
        <pre
          className={cn(
            "m-0 flex-1 font-mono text-sm leading-6 bg-transparent border-0 rounded-none min-w-0 py-4 px-3",
            wrap ? "whitespace-pre-wrap break-words overflow-visible" : "overflow-visible whitespace-pre"
          )}
        >
          <NodeViewContent
            as="div"
            className="hljs !text-inherit !bg-transparent !p-0 !font-mono !leading-6 !text-sm block"
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
