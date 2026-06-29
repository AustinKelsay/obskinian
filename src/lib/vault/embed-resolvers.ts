/**
 * Embed resolution helpers for full note transclusion in the editor.
 */

import type { VaultFolder } from "./types";
import { findFileByLink } from "./vault-data";
import {
  buildEmbedPreview,
  markdownToHtml,
  parseWikiLinkTarget,
  normalizeLinkTarget,
  type MarkdownToHtmlOptions,
} from "./link-parser";

const MAX_EMBED_DEPTH = 3;

/** Creates embed resolver callbacks with circular-reference protection */
export function createEmbedResolvers(vault: VaultFolder): Pick<
  MarkdownToHtmlOptions,
  "resolveEmbed" | "resolveEmbedHtml"
> {
  const visited = new Set<string>();

  function resolveNoteBody(target: string, depth: number): string | null {
    const { note } = parseWikiLinkTarget(target);
    const key = normalizeLinkTarget(note).toLowerCase();
    const file = findFileByLink(vault, note);
    if (!file) return null;
    if (depth >= MAX_EMBED_DEPTH) return `<p>${buildEmbedPreview(file.content)}</p>`;
    if (visited.has(key)) {
      return `<p class="wiki-embed-recursive"><em>Recursive embed: ${note}</em></p>`;
    }

    visited.add(key);
    const html = markdownToHtml(file.content, {
      resolveEmbed: (t) => {
        const f = findFileByLink(vault, parseWikiLinkTarget(t).note);
        return f ? buildEmbedPreview(f.content) : null;
      },
      resolveEmbedHtml: (t) => resolveNoteBody(t, depth + 1),
    });
    visited.delete(key);
    return html;
  }

  return {
    resolveEmbed: (target) => {
      const file = findFileByLink(vault, parseWikiLinkTarget(target).note);
      return file ? buildEmbedPreview(file.content) : null;
    },
    resolveEmbedHtml: (target) => resolveNoteBody(target, 0),
  };
}
