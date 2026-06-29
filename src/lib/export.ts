/**
 * Note export utilities — HTML export for sharing and archiving.
 */

import { markdownToHtml } from "@/lib/vault/link-parser";
import { getFileDisplayName } from "@/lib/utils";

/** Exports note markdown as a styled HTML string */
export function exportNoteAsHtml(title: string, markdown: string): string {
  const body = markdownToHtml(markdown);
  const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <style>
    body { font-family: Inter, system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #222; }
    h1 { border-bottom: 1px solid #e0e0e0; padding-bottom: 0.3em; }
    code { background: #f5f5f5; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.9em; }
    pre { background: #f5f5f5; padding: 1em; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 3px solid #7f6df2; margin: 1em 0; padding-left: 1em; color: #666; }
    a, .wiki-link { color: #7f6df2; text-decoration: none; }
    hr { border: none; border-top: 1px solid #e0e0e0; margin: 2em 0; }
  </style>
</head>
<body>${body}</body>
</html>`;
}

/** Triggers browser download of note as HTML file */
export function downloadNoteAsHtml(filePath: string, markdown: string): void {
  const title = getFileDisplayName(filePath);
  const html = exportNoteAsHtml(title, markdown);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Copies note HTML to clipboard */
export async function copyNoteAsHtml(filePath: string, markdown: string): Promise<void> {
  const title = getFileDisplayName(filePath);
  const html = exportNoteAsHtml(title, markdown);
  await navigator.clipboard.writeText(html);
}
