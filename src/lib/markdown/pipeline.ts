/**
 * Unified markdown pipeline for reading mode — GFM tables and LaTeX math.
 * Obsidian-specific syntax is protected before processing and restored after.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import type { EditorMode } from "@/lib/vault/types";
import { markdownToHtml, type MarkdownToHtmlOptions } from "@/lib/vault/link-parser";

interface ProtectResult {
  text: string;
  snippets: string[];
}

const SNIP_RE = /OBXSNIP(\d+)END/g;

/** Wraps Obsidian-only syntax in restorable placeholders */
function protectObsidianSyntax(md: string): ProtectResult {
  const snippets: string[] = [];
  let text = md;

  const stash = (snippet: string): string => {
    const id = snippets.length;
    snippets.push(snippet);
    return `OBXSNIP${id}END`;
  };

  text = text.replace(/```[\s\S]*?```/g, (block) => stash(block));
  text = text.replace(/^>\s+\[!(\w+)\][\s\S]*?(?=\n(?!> )|\n*$)/gm, (block) => stash(block));
  text = text.replace(/!\[\[[^\]]+\]\]/g, (m) => stash(m));
  text = text.replace(/(?<!!)\[\[[^\]]+\]\]/g, (m) => stash(m));

  return { text, snippets };
}

/** Restores Obsidian snippets as rendered HTML */
function restoreObsidianSyntax(
  html: string,
  snippets: string[],
  options?: MarkdownToHtmlOptions
): string {
  return html.replace(SNIP_RE, (_, index) => {
    const snippet = snippets[Number(index)] ?? "";
    return markdownToHtml(snippet, options);
  });
}

/** Renders markdown through remark/rehype for GFM + math, then restores Obsidian blocks */
export function renderReadingHtml(body: string, options?: MarkdownToHtmlOptions): string {
  const { text, snippets } = protectObsidianSyntax(body);

  const standardHtml = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeKatex)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(text)
  );

  return restoreObsidianSyntax(standardHtml, snippets, options);
}

/** Cycles editor mode: live → source → reading → live */
export function cycleEditorMode(current: EditorMode): EditorMode {
  if (current === "live") return "source";
  if (current === "source") return "reading";
  return "live";
}
