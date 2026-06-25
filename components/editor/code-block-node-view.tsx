"use client";

import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from "@tiptap/react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Copy, Check, WrapText } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = LANGUAGES.find((l) => l.value === language) ?? LANGUAGES[0];

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
      <div className="code-block-header flex items-center justify-between px-3 py-1.5 bg-[var(--cb-header)] border-b border-[var(--cb-border)]">
        <div className="flex gap-1.5 items-center">
          <span className="size-2.5 rounded-full bg-[var(--cb-dot)]" />
          <span className="size-2.5 rounded-full bg-[var(--cb-dot)]" />
          <span className="size-2.5 rounded-full bg-[var(--cb-dot)]" />
        </div>

        <div className="flex items-center gap-1">
          {/* Wrap toggle */}
          <button
            type="button"
            contentEditable={false}
            onClick={() => setWrap((v) => !v)}
            title={wrap ? "Nonaktifkan word wrap" : "Aktifkan word wrap"}
            className={cn(
              "flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded transition-colors select-none",
              wrap
                ? "text-[var(--cb-label-hover)] bg-[var(--cb-dot)]"
                : "text-[var(--cb-label)] hover:text-[var(--cb-label-hover)] hover:bg-[var(--cb-dot)]"
            )}
          >
            <WrapText className="size-3" />
          </button>

          {/* Copy button */}
          <button
            type="button"
            contentEditable={false}
            onClick={handleCopy}
            title="Salin kode"
            className={cn(
              "flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded transition-colors select-none",
              copied
                ? "text-green-600 dark:text-green-400"
                : "text-[var(--cb-label)] hover:text-[var(--cb-label-hover)] hover:bg-[var(--cb-dot)]"
            )}
          >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          </button>

          {/* Language selector */}
          <div className="relative">
            <button
              type="button"
              contentEditable={false}
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 text-[11px] font-mono text-[var(--cb-label)] hover:text-[var(--cb-label-hover)] transition-colors px-1.5 py-0.5 rounded hover:bg-[var(--cb-dot)] select-none"
            >
              {current.label}
              <ChevronDown className="size-3 opacity-70" />
            </button>

            {open && (
              <div
                contentEditable={false}
                className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-md shadow-md py-1 min-w-[140px] max-h-64 overflow-y-auto"
                onMouseLeave={() => setOpen(false)}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => {
                      updateAttributes({ language: l.value });
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1 text-xs font-mono hover:bg-accent transition-colors",
                      l.value === language && "text-primary font-semibold"
                    )}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Body: line numbers + code ───────────────────────────────── */}
      <div className="flex bg-[var(--cb-bg)] overflow-x-auto">
        {/* Line numbers — sticky so they don't scroll horizontally */}
        <div
          contentEditable={false}
          aria-hidden="true"
          className="sticky left-0 z-[1] select-none shrink-0 flex flex-col items-end py-4 pl-3 pr-3 bg-[var(--cb-bg)] border-r border-[var(--cb-border)] text-[var(--cb-label)] font-mono text-sm leading-relaxed"
        >
          {lines.map((n) => (
            <span key={n} className="tabular-nums leading-relaxed opacity-50 text-xs">
              {n}
            </span>
          ))}
        </div>

        {/* Code content */}
        <pre
          ref={preRef}
          className={cn(
            "m-0 flex-1 p-4 font-mono text-sm leading-relaxed bg-transparent border-0 rounded-none min-w-0",
            wrap ? "whitespace-pre-wrap break-all overflow-visible" : "overflow-visible whitespace-pre"
          )}
        >
          <NodeViewContent as="div" className="hljs !bg-transparent !p-0 !font-mono" />
        </pre>
      </div>
    </NodeViewWrapper>
  );
}
