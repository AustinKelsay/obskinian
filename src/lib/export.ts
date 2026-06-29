/**
 * Note export utilities — HTML export using the reading-mode markdown pipeline.
 */

import { renderReadingHtml } from "@/lib/markdown/pipeline";
import { createEmbedResolvers } from "@/lib/vault/embed-resolvers";
import type { VaultFolder } from "@/lib/vault/types";
import { getFileDisplayName } from "@/lib/utils";

const EXPORT_STYLES = `
  body { font-family: Inter, system-ui, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #222; background: #fff; }
  h1 { border-bottom: 1px solid #e0e0e0; padding-bottom: 0.3em; }
  h2, h3, h4, h5, h6 { margin-top: 1.5em; }
  code { background: #f5f5f5; padding: 0.15em 0.4em; border-radius: 3px; font-size: 0.9em; }
  pre { background: #f5f5f5; padding: 1em; border-radius: 6px; overflow-x: auto; }
  pre code { background: transparent; padding: 0; }
  blockquote { border-left: 3px solid #7f6df2; margin: 1em 0; padding-left: 1em; color: #666; }
  a, .wiki-link { color: #7f6df2; text-decoration: none; }
  hr { border: none; border-top: 1px solid #e0e0e0; margin: 2em 0; }
  table { width: 100%; border-collapse: collapse; margin: 1em 0; font-size: 0.9em; }
  th, td { border: 1px solid #ddd; padding: 0.5em 0.75em; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  .callout { border-left: 4px solid #448aff; border-radius: 6px; padding: 0.75em 1em; margin: 1em 0; background: rgba(68, 138, 255, 0.08); }
  .callout-title { font-weight: 600; margin-bottom: 0.25em; }
  .wiki-embed { border: 1px solid #e0e0e0; border-radius: 8px; margin: 1em 0; overflow: hidden; }
  .wiki-embed-header { padding: 0.4em 0.75em; font-weight: 600; color: #7f6df2; background: #f5f5f5; border-bottom: 1px solid #e0e0e0; }
  .wiki-embed-body, .wiki-embed-content { padding: 0.75em 1em; }
  .wiki-image { max-width: 100%; border-radius: 6px; margin: 1em 0; }
  .katex-display { overflow-x: auto; margin: 1em 0; }
`;

/** Exports note markdown as a styled HTML string with GFM, math, and embeds */
export function exportNoteAsHtml(
  title: string,
  markdown: string,
  vault?: VaultFolder
): string {
  const embedOptions = vault ? createEmbedResolvers(vault) : undefined;
  const body = renderReadingHtml(markdown, embedOptions);
  const safeTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <style>${EXPORT_STYLES}</style>
</head>
<body>${body}</body>
</html>`;
}

/** Triggers browser download of note as HTML file */
export function downloadNoteAsHtml(
  filePath: string,
  markdown: string,
  vault?: VaultFolder
): void {
  const title = getFileDisplayName(filePath);
  const html = exportNoteAsHtml(title, markdown, vault);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Copies note HTML to clipboard */
export async function copyNoteAsHtml(
  filePath: string,
  markdown: string,
  vault?: VaultFolder
): Promise<void> {
  const title = getFileDisplayName(filePath);
  const html = exportNoteAsHtml(title, markdown, vault);
  await navigator.clipboard.writeText(html);
}
