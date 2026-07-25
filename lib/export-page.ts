// Minimal shape we need from the Tiptap/BlockNote editor instance,
// kept local so this module doesn't depend on a specific editor package.
export interface ExportableEditor {
  getHTML: () => string;
  getText: () => string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPageAsHTML(editor: ExportableEditor, title: string) {
  const body = editor.getHTML();
  const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #111; }
    h1,h2,h3,h4,h5,h6 { line-height: 1.25; margin: 1.5em 0 0.5em; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 6px; overflow-x: auto; }
    code { font-family: monospace; font-size: 0.9em; background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 3px; }
    pre code { background: none; padding: 0; }
    blockquote { border-left: 3px solid #ccc; margin: 0; padding-left: 1rem; color: #666; }
    img { max-width: 100%; height: auto; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${body}
</body>
</html>`;
  downloadFile(html, `${slugify(title) || "untitled"}.html`, "text/html;charset=utf-8");
}

export async function exportPageAsMarkdown(editor: ExportableEditor, title: string) {
  const { default: TurndownService } = await import("turndown");
  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
  });
  td.addRule("taskList", {
    filter: (node: HTMLElement) =>
      node.nodeName === "LI" && node.querySelector('input[type="checkbox"]') !== null,
    replacement: (_content: string, node: Node) => {
      const checkbox = (node as Element).querySelector('input[type="checkbox"]') as HTMLInputElement | null;
      const checked = checkbox?.checked ? "x" : " ";
      const text = (node.textContent ?? "").replace(/^\s*\n/, "").trimEnd();
      return `- [${checked}] ${text}\n`;
    },
  });

  const html = editor.getHTML();
  const md = `# ${title}\n\n${td.turndown(html)}`;
  downloadFile(md, `${slugify(title) || "untitled"}.md`, "text/markdown;charset=utf-8");
}
