/**
 * Wiki-link and markdown link parsing utilities.
 * Extracts [[wiki-links]], embeds, callouts, and backlinks from note content.
 */

import type { BacklinkEntry } from "./types";

export interface MarkdownToHtmlOptions {
  /** Resolves embed target to preview text */
  resolveEmbed?: (target: string) => string | null;
}

/** Strips heading/block suffix from wiki-link targets */
export function normalizeLinkTarget(link: string): string {
  return link.split("#")[0].split("^")[0].trim();
}

/** Extracts all [[wiki-link]] targets from markdown content (excludes embeds) */
export function extractWikiLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /(?<!!)\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    links.push(normalizeLinkTarget(match[1]));
  }
  return links;
}

/** Extracts all ![[wiki-embed]] targets from markdown content */
export function extractWikiEmbeds(content: string): string[] {
  const embeds: string[] = [];
  const regex = /!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    embeds.push(normalizeLinkTarget(match[1]));
  }
  return embeds;
}

/** Converts heading text to a DOM id slug */
export function headingToId(text: string): string {
  return text.replace(/\[\[|\]\]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Extracts markdown headings for the outline panel */
export function extractHeadings(content: string): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const lines = content.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/\[\[|\]\]/g, "").trim();
      headings.push({ level, text, id: headingToId(text) });
    }
  }
  return headings;
}

/** Extracts #tags from content */
export function extractTags(content: string): string[] {
  const tags = new Set<string>();
  const regex = /(?:^|\s)#([a-zA-Z][\w/-]*)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    tags.add(match[1]);
  }
  return Array.from(tags);
}

/** Escapes HTML special characters */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Escapes regex special characters */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Parses Obsidian-style callout blocks into HTML */
function parseCallouts(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const calloutMatch = lines[i].match(/^>\s+\[!(\w+)\]\s*(.*)$/);
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase();
      const title = calloutMatch[2].trim() || type.charAt(0).toUpperCase() + type.slice(1);
      const bodyLines: string[] = [];
      i += 1;

      while (i < lines.length) {
        const lineMatch = lines[i].match(/^>\s?(.*)$/);
        if (!lineMatch) break;
        bodyLines.push(lineMatch[1]);
        i += 1;
      }

      const bodyHtml = bodyLines
        .filter((l) => l.trim())
        .map((l) => `<p>${escapeHtml(l)}</p>`)
        .join("");

      result.push(
        `<div class="callout callout-${type}" data-callout-type="${type}">` +
          `<div class="callout-title">${escapeHtml(title)}</div>` +
          `<div class="callout-content">${bodyHtml}</div>` +
          `</div>`
      );
    } else {
      result.push(lines[i]);
      i += 1;
    }
  }

  return result.join("\n");
}

/** Converts markdown to basic HTML for TipTap initial content */
export function markdownToHtml(md: string, options?: MarkdownToHtmlOptions): string {
  let html = parseCallouts(md);

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langAttr = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${langAttr}>${escapeHtml(code.trim())}</code></pre>`;
  });

  html = html.replace(/^######\s+(.+)$/gm, (_, t) => `<h6 id="${headingToId(t)}">${t}</h6>`);
  html = html.replace(/^#####\s+(.+)$/gm, (_, t) => `<h5 id="${headingToId(t)}">${t}</h5>`);
  html = html.replace(/^####\s+(.+)$/gm, (_, t) => `<h4 id="${headingToId(t)}">${t}</h4>`);
  html = html.replace(/^###\s+(.+)$/gm, (_, t) => `<h3 id="${headingToId(t)}">${t}</h3>`);
  html = html.replace(/^##\s+(.+)$/gm, (_, t) => `<h2 id="${headingToId(t)}">${t}</h2>`);
  html = html.replace(/^#\s+(.+)$/gm, (_, t) => `<h1 id="${headingToId(t)}">${t}</h1>`);

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>");

  html = html.replace(
    /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target) => {
      const trimmed = target.trim();
      const preview = options?.resolveEmbed?.(trimmed);
      const previewText = preview
        ? escapeHtml(preview.slice(0, 280))
        : '<span class="wiki-embed-missing">Note not found</span>';
      return (
        `<div class="wiki-embed" data-target="${escapeHtml(trimmed)}" contenteditable="false">` +
          `<div class="wiki-embed-header">${escapeHtml(trimmed)}</div>` +
          `<div class="wiki-embed-body">${previewText}</div>` +
          `</div>`
      );
    }
  );

  html = html.replace(
    /(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target, alias) =>
      `<span class="wiki-link" data-target="${escapeHtml(normalizeLinkTarget(target))}">${escapeHtml(alias ?? target.trim())}</span>`
  );

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  html = html.replace(/^---$/gm, "<hr>");

  html = html.replace(
    /^-\s+\[ \]\s+(.+)$/gm,
    '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>$1</p></div></li></ul>'
  );
  html = html.replace(
    /^-\s+\[x\]\s+(.+)$/gm,
    '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked><span></span></label><div><p>$1</p></div></li></ul>'
  );

  html = html.replace(/^-\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  const lines = html.split("\n");
  html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|p|div)/.test(trimmed)) return line;
      return `<p>${line}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

/** Finds linked backlinks — notes with [[wiki-links]] to the target */
export function findLinkedBacklinks(
  noteName: string,
  allNotes: { id: string; path: string; name: string; content: string }[]
): BacklinkEntry[] {
  const results: BacklinkEntry[] = [];
  const target = noteName.replace(/\.md$/, "");

  for (const note of allNotes) {
    if (note.name.replace(/\.md$/, "") === target) continue;
    const links = extractWikiLinks(note.content);
    if (links.some((l) => l.toLowerCase() === target.toLowerCase())) {
      const contextLine =
        note.content.split("\n").find((l) => l.includes(`[[${target}`)) ?? "";
      results.push({
        fileId: note.id,
        filePath: note.path,
        fileName: note.name.replace(/\.md$/, ""),
        context: contextLine.trim(),
        kind: "linked",
      });
    }
  }
  return results;
}

/** Finds unlinked mentions — plain-text references without wiki-links */
export function findUnlinkedMentions(
  noteName: string,
  allNotes: { id: string; path: string; name: string; content: string }[]
): BacklinkEntry[] {
  const results: BacklinkEntry[] = [];
  const target = noteName.replace(/\.md$/, "");
  const pattern = new RegExp(`\\b${escapeRegex(target)}\\b`, "i");

  for (const note of allNotes) {
    if (note.name.replace(/\.md$/, "").toLowerCase() === target.toLowerCase()) continue;

    const linkedTargets = extractWikiLinks(note.content).map((l) => l.toLowerCase());
    if (linkedTargets.includes(target.toLowerCase())) continue;

    const mentionLine = note.content.split("\n").find((line) => {
      if (!pattern.test(line)) return false;
      if (line.includes(`[[${target}`)) return false;
      return true;
    });

    if (mentionLine) {
      results.push({
        fileId: note.id,
        filePath: note.path,
        fileName: note.name.replace(/\.md$/, ""),
        context: mentionLine.trim(),
        kind: "unlinked",
      });
    }
  }
  return results;
}

/** Finds all backlinks — linked and unlinked combined */
export function findBacklinks(
  noteName: string,
  allNotes: { id: string; path: string; name: string; content: string }[]
): BacklinkEntry[] {
  return [
    ...findLinkedBacklinks(noteName, allNotes),
    ...findUnlinkedMentions(noteName, allNotes),
  ];
}

/** Builds a short preview string from note body for embeds */
export function buildEmbedPreview(body: string): string {
  const lines = body.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("---")) continue;
    return trimmed.replace(/\[\[|\]\]/g, "").replace(/[#*`]/g, "").trim();
  }
  return lines.find((l) => l.trim())?.trim() ?? "";
}
