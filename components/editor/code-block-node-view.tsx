"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { useState, useRef } from "react";
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
  const copyTimer = useRef < ReturnType < typeof setTimeout > | null > (null);
  
  const lineCount = Math.max(1, (node.textContent ?? "").split("\n").length);
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);
  
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
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="code-block-header flex items-center justify-between px-3 py-1.5 bg-muted/70 border-b border-muted-foreground/40">
        <div className="flex gap-1.5 items-center">
          <span className="size-2.5 rounded-full bg-muted-foreground" />
          <span className="size-2.5 rounded-full bg-muted-foreground" />
          <span className="size-2.5 rounded-full bg-muted-foreground" />
        </div>

        <div className="flex items-center gap-1">
          {/* Wrap toggle */}
          <Button
            type="button"
            variant={wrap ? "secondary" : "ghost"}
            size="icon-xs"
            contentEditable={false}
            onClick={() => setWrap((v) => !v)}
            title={wrap ? "Nonaktifkan word wrap" : "Aktifkan word wrap"}
            className="text-[11px] cursor-pointer transition-colors select-none"
          >
            <WrapText className="size-3" />
          </Button>

          {/* Copy button */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            contentEditable={false}
            onClick={handleCopy}
            title="Salin kode"
            className="text-[11px] cursor-pointer transition-colors select-none"
          >
            {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
          </Button>

          {/* Language selector */}
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

      {/* ── Body: line numbers + code ─────────────────────────────────*/}
      <div className="flex bg-muted overflow-x-auto">
      {/*Line numbers — sticky so they don't scroll horizontally */}
        <div
          contentEditable={false}
          aria-hidden="true"
          className="sticky left-0 z-[1] select-none shrink-0 flex flex-col items-end py-4 px-3 bg-muted/40 border-r border-muted-foreground/40 text-muted-foreground font-mono"
        >
          {lines.map((n) => (
            <span key={n} className="tabular-nums leading-6 opacity-50 text-sm">
              {n}
            </span>
          ))}
        </div>

        {/* Code content */}
        <pre
          ref={preRef}
          className={cn(
            "m-0 flex-1 font-mono text-sm leading-6 bg-transparent border-0 rounded-none min-w-0",
            wrap ? "whitespace-pre-wrap break-all overflow-visible" : "overflow-visible whitespace-pre"
          )}
        >
          <NodeViewContent as="div" className="hljs !text-inherit !bg-transparent !py-4 !px-2 !font-mono !leading-6 !text-sm" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
