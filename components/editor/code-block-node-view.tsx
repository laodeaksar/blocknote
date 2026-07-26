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
  { value: "plaintext",   label: "Plain text" },
  { value: "javascript",  label: "JavaScript" },
  { value: "typescript",  label: "TypeScript" },
  { value: "python",      label: "Python" },
  { value: "bash",        label: "Bash / Shell" },
  { value: "css",         label: "CSS" },
  { value: "html",        label: "HTML" },
  { value: "json",        label: "JSON" },
  { value: "sql",         label: "SQL" },
  { value: "go",          label: "Go" },
  { value: "rust",        label: "Rust" },
  { value: "java",        label: "Java" },
  { value: "cpp",         label: "C++" },
  { value: "c",           label: "C" },
  { value: "csharp",      label: "C#" },
  { value: "php",         label: "PHP" },
  { value: "ruby",        label: "Ruby" },
  { value: "swift",       label: "Swift" },
  { value: "kotlin",      label: "Kotlin" },
  { value: "yaml",        label: "YAML" },
  { value: "markdown",    label: "Markdown" },
  { value: "diff",        label: "Diff" },
  { value: "graphql",     label: "GraphQL" },
  { value: "lua",         label: "Lua" },
  { value: "r",           label: "R" },
  { value: "xml",         label: "XML" },
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
      {/* Header sama */}
      <div className="code-block-header flex items-center justify-between px-3 py-1.5 bg-[var(--cb-header)] border-b border-[var(--cb-border)]">
        <div className="flex gap-1.5 items-center">
          <span className="size-2.5 rounded-full bg-[var(--cb-dot)]" />
          <span className="size-2.5 rounded-full bg-[var(--cb-dot)]" />
          <span className="size-2.5 rounded-full bg-[var(--cb-dot)]" />
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" contentEditable={false} onClick={() => setWrap((v) =>!v)} className="h-auto gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded">
            <WrapText className="size-3" />
          </Button>
          <Button type="button" variant="ghost" contentEditable={false} onClick={handleCopy} className="h-auto gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded">
            {copied? <Check className="size-3" /> : <Copy className="size-3" />}
          </Button>
          <div contentEditable={false}>
            <Select value={language} onValueChange={(val) => updateAttributes({ language: val })}>
              <SelectTrigger size="sm" className="h-auto gap-1 rounded border-0 px-1.5 py-0.5 text-[11px] font-mono">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end" className="font-mono">
                {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value} className="text-xs font-mono">{l.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* BODY FIX */}
      <div className="grid grid-cols-[auto_1fr] bg-[var(--cb-bg)] overflow-x-auto">
        {/* Line numbers */}
        <div
          contentEditable={false}
          aria-hidden="true"
          className="sticky left-0 z-[1] select-none shrink-0 py-4 pl-3 pr-3 bg-[var(--cb-bg)] border-r border-[var(--cb-border)] text-[var(--cb-label)] font-mono text-xs leading-[1.6]"
        >
          {lines.map((n) => (
            <div key={n} className="tabular-nums opacity-50 h-[1.6em]"> {/* h sama dengan line-height */}
              {n}
            </div>
          ))}
        </div>

        {/* Code content */}
        <pre
          ref={preRef}
          className={cn(
            "m-0 p-4 font-mono text-xs leading-[1.6] bg-transparent border-0 rounded-none min-w-0", // text-xs + leading sama
            wrap? "whitespace-pre-wrap break-words" : "whitespace-pre"
          )}
        >
          <NodeViewContent
            as="div"
            className="hljs!bg-transparent!p-0!font-mono!text-inherit!leading-[1.6]" // paksa inherit
          />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}