"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { useState, useRef, useLayoutEffect, useCallback } from "react";
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
  const preRef = useRef < HTMLPreElement > (null);
  const mirrorRef = useRef < HTMLDivElement > (null); // buat ukur tinggi
  const copyTimer = useRef < ReturnType < typeof setTimeout > | null > (null);
  
  // -1 = baris lanjutan karena wrap. Tidak dirender angkanya
  const [lineNumbers, setLineNumbers] = useState < number[] > ([1]);
  const [lineHeight, setLineHeight] = useState(24);
  
  const recalcLineNumbers = useCallback(() => {
    const pre = preRef.current;
    const mirror = mirrorRef.current;
    if (!pre) return;
    
    const text = node.textContent ?? "";
    const rawLines = text.length ? text.split("\n") : [""];
    const style = getComputedStyle(pre);
    const nextLineHeight = parseFloat(style.lineHeight) || 24;

    setLineHeight(nextLineHeight);
    
    // Kalau tidak wrap, langsung 1:1
    if (!wrap || !mirror) {
      setLineNumbers(rawLines.map((_, i) => i + 1));
      return;
    }
    
    // Samakan style mirror dengan pre biar ukurannya sama
    const horizontalPadding =
      parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    mirror.style.width = `${Math.max(0, pre.clientWidth - horizontalPadding)}px`;
    mirror.style.font = style.font;
    mirror.style.lineHeight = `${nextLineHeight}px`;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.padding = "0";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordBreak = "break-all";
    
    const numbers: number[] = [];
    
    rawLines.forEach((line, idx) => {
      const row = document.createElement("div");
      row.style.whiteSpace = "pre-wrap";
      row.style.wordBreak = "break-all";
      row.textContent = line.length ? line : "\u200b"; // baris kosong tetap 1 baris
      mirror.appendChild(row);
      
      const visualRows = Math.max(
        1,
        Math.round(row.getBoundingClientRect().height / nextLineHeight)
      );
      mirror.removeChild(row);
      
      numbers.push(idx + 1); // baris pertama ada nomornya
      for (let r = 1; r < visualRows; r++) numbers.push(-1); // baris lanjutan kosong
    });
    
    setLineNumbers(numbers);
  }, [node.textContent, wrap]);
  
  // Recalc saat konten berubah atau toggle wrap
  useLayoutEffect(() => {
    recalcLineNumbers();
  }, [recalcLineNumbers]);
  
  // Recalc saat resize sidebar/container
  useLayoutEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    const ro = new ResizeObserver(() => recalcLineNumbers());
    ro.observe(pre);
    return () => ro.disconnect();
  }, [recalcLineNumbers]);
  
  const handleCopy = () => {
    const text = preRef.current?.innerText ?? node.textContent ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <NodeViewWrapper
      className={cn(
        "code-block-wrapper not-prose relative my-4 rounded-lg overflow-hidden",
        selected && "ring-2 ring-ring"
      )}
    >
      {/* Header */}
      <div className="code-block-header flex items-center justify-between px-3 py-1.5 bg-muted/70 border-b border-muted-foreground/40">
        <div className="flex gap-1.5 items-center">
          <span className="size-2.5 rounded-full bg-muted-foreground/60" />
          <span className="size-2.5 rounded-full bg-muted-foreground/60" />
          <span className="size-2.5 rounded-full bg-muted-foreground/60" />
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant={wrap? "outline" : "ghost"}
            size="icon-xs"
            contentEditable={false}
            onClick={() => setWrap((v) =>!v)}
            title={wrap? "Nonaktifkan word wrap" : "Aktifkan word wrap"}
            className="text-[11px] cursor-pointer transition-colors select-none"
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
            className="text-[11px] cursor-pointer transition-colors select-none"
          >
            {copied? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
          </Button>

          <div contentEditable={false}>
            <Select
              value={language}
              onValueChange={(val) => updateAttributes({ language: val })}
            >
              <SelectTrigger
                size="sm"
                className="w-fit h-auto gap-1 rounded border-0 bg-transparent px-1.5 py-0.5 text-[11px] font-mono cursor-pointer select-none focus-visible:ring-0 focus-visible:border-transparent"
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

      {/* Body: line numbers + code */}
      <div className="flex bg-muted">
        <div
          contentEditable={false}
          aria-hidden="true"
          className="sticky left-0 z-[1] select-none shrink-0 flex flex-col items-end py-4 px-3 bg-muted/40 border-r border-muted-foreground/40 text-muted-foreground font-mono"
          style={{ lineHeight: `${lineHeight}px` }}
        >
          {lineNumbers.map((n, i) => (
            <span
              key={i}
              className="tabular-nums shrink-0 opacity-50 text-sm"
              style={{
                height: `${lineHeight}px`,
                lineHeight: `${lineHeight}px`,
              }}
            >
              {n > 0 ? n : ""}
            </span>
          ))}
        </div>

        <pre
          ref={preRef}
          className={cn(
            "m-0 flex-1 py-4 px-2 font-mono text-sm leading-6 bg-transparent border-0 rounded-none min-w-0",
            wrap ? "whitespace-pre-wrap break-all" : "whitespace-pre overflow-x-auto"
          )}
        >
          <NodeViewContent
            as="div"
            className="hljs!block!text-inherit!bg-transparent!p-0!font-mono!leading-6!text-sm"
          />
        </pre>

        {/* Mirror tersembunyi untuk ukur tinggi baris saat wrap */}
        <div
          ref={mirrorRef}
          aria-hidden="true"
          className="font-mono text-sm"
          style={{
            position: "absolute",
            visibility: "hidden",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: -1,
          }}
        />
      </div>
    </NodeViewWrapper>
  );
}