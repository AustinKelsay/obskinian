/**
 * Wiki-link and markdown link parsing utilities.
 * Extracts [[wiki-links]], embeds, callouts, and backlinks from note content.
 */

import type { BacklinkEntry } from "./types";

export interface MarkdownToHtmlOptions {
  /** Resolves embed target to preview text */
  resolveEmbed?: (target: string) => string | null;
  /** Resolves embed target to full HTML body for transclusion */
  resolveEmbedHtml?: (target: string) => string | null;
}

export interface ParsedWikiTarget {
  note: string;
  subpath?: string;
}

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)$/i;

/** Strips heading/block suffix from wiki-link targets for note resolution */
export function normalizeLinkTarget(link: string): string {
  const hashIdx = link.indexOf("#");
  const base = hashIdx >= 0 ? link.slice(0, hashIdx) : link;
  return base.split("^")[0].trim();
}

/** Parses a wiki-link target into note name and optional subpath (heading or block) */
export function parseWikiLinkTarget(link: string): ParsedWikiTarget {
  const hashIdx = link.indexOf("#");
  if (hashIdx < 0) return { note: link.trim() };
  return {
    note: link.slice(0, hashIdx).trim(),
    subpath: link.slice(hashIdx + 1),
  };
}

/** Returns true when subpath is a block reference (^block-id) */
export function isBlockSubpath(subpath: string): boolean {
  return subpath.startsWith("^");
}

/** Returns true when embed target is an image file */
export function isImageEmbed(target: string): boolean {
  const { note } = parseWikiLinkTarget(target);
  return IMAGE_EXT.test(note);
}

/** Builds vault asset URL for an image path */
export function vaultAssetUrl(relativePath: string): string {
  return `/api/vault/asset?path=${encodeURIComponent(relativePath)}`;
}

/** Extracts block id suffix from a markdown line, if present */
export function stripBlockIdSuffix(line: string): { text: string; blockId?: string } {
  const match = line.match(/^(.*?)\s+\^([a-zA-Z][\w-]*)\s*$/);
  if (!match) return { text: line };
  return { text: match[1], blockId: `^${match[2]}` };
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

/** Extracts all ![[wiki-embed]] targets from markdown content (notes only) */
export function extractWikiEmbeds(content: string): string[] {
  const embeds: string[] = [];
  const regex = /!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    const target = normalizeLinkTarget(match[1]);
    if (!isImageEmbed(match[1])) embeds.push(target);
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
    const { text: stripped } = stripBlockIdSuffix(line);
    const match = stripped.match(/^(#{1,6})\s+(.+)$/);
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
    const trimmed = code.trim();
    if (lang === "mermaid") {
      return (
        `<div class="mermaid-diagram" contenteditable="false" ` +
        `data-mermaid-source="${escapeHtml(trimmed)}">${escapeHtml(trimmed)}</div>`
      );
    }
    const langAttr = lang ? ` data-lang="${lang}" class="language-${lang}"` : "";
    return `<pre><code${langAttr}>${escapeHtml(trimmed)}</code></pre>`;
  });

  const headingHtml = (level: number, t: string, bid?: string) => {
    const id = bid ? `^${bid}` : headingToId(t);
    return `<h${level} id="${id}">${t.trim()}</h${level}>`;
  };

  html = html.replace(/^######\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => headingHtml(6, t, bid));
  html = html.replace(/^#####\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => headingHtml(5, t, bid));
  html = html.replace(/^####\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => headingHtml(4, t, bid));
  html = html.replace(/^###\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => headingHtml(3, t, bid));
  html = html.replace(/^##\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => headingHtml(2, t, bid));
  html = html.replace(/^#\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => headingHtml(1, t, bid));

  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/~~(.+?)~~/g, "<s>$1</s>");

  html = html.replace(
    /!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target) => {
      const trimmed = target.trim();
      if (isImageEmbed(trimmed)) {
        const { note } = parseWikiLinkTarget(trimmed);
        return (
          `<img class="wiki-image" src="${vaultAssetUrl(note)}" ` +
            `alt="${escapeHtml(note)}" data-path="${escapeHtml(note)}" contenteditable="false" />`
        );
      }
      const { note, subpath } = parseWikiLinkTarget(trimmed);
      const lookupTarget = subpath ? `${note}#${subpath}` : note;
      const fullHtml =
        options?.resolveEmbedHtml?.(lookupTarget) ?? options?.resolveEmbedHtml?.(note);
      const preview = options?.resolveEmbed?.(lookupTarget) ?? options?.resolveEmbed?.(note);

      let bodyContent: string;
      if (fullHtml) {
        bodyContent = `<div class="wiki-embed-content">${fullHtml}</div>`;
      } else if (preview) {
        bodyContent = escapeHtml(preview.slice(0, 280));
      } else {
        bodyContent = '<span class="wiki-embed-missing">Note not found</span>';
      }

      return (
        `<div class="wiki-embed${fullHtml ? " wiki-embed-full" : ""}" data-target="${escapeHtml(trimmed)}" contenteditable="false">` +
          `<div class="wiki-embed-header">${escapeHtml(note)}</div>` +
          `<div class="wiki-embed-body">${bodyContent}</div>` +
          `</div>`
      );
    }
  );

  html = html.replace(
    /(?<!!)\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target, alias) => {
      const fullTarget = target.trim();
      const display = alias ?? fullTarget;
      const aliasAttr = alias ? ` data-alias="${escapeHtml(alias)}"` : "";
      return (
        `<span class="wiki-link" data-target="${escapeHtml(fullTarget)}"${aliasAttr}>` +
          `${escapeHtml(display)}</span>`
      );
    }
  );

  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote><p>$1</p></blockquote>");
  html = html.replace(/^---$/gm, "<hr>");

  html = html.replace(
    /^-\s+\[ \]\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm,
    (_, t, bid) => {
      const idAttr = bid ? ` id="^${bid}"` : "";
      return `<ul data-type="taskList"><li data-type="taskItem" data-checked="false"${idAttr}><label><input type="checkbox"><span></span></label><div><p>${t}</p></div></li></ul>`;
    }
  );
  html = html.replace(
    /^-\s+\[x\]\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm,
    (_, t, bid) => {
      const idAttr = bid ? ` id="^${bid}"` : "";
      return `<ul data-type="taskList"><li data-type="taskItem" data-checked="true"${idAttr}><label><input type="checkbox" checked><span></span></label><div><p>${t}</p></div></li></ul>`;
    }
  );

  html = html.replace(/^-\s+(.+?)(?:\s+\^([a-zA-Z][\w-]*))?\s*$/gm, (_, t, bid) => {
    const idAttr = bid ? ` id="^${bid}"` : "";
    return `<li${idAttr}>${t}</li>`;
  });
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  const lines = html.split("\n");
  html = lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|p|div|img)/.test(trimmed)) return line;

      const blockMatch = trimmed.match(/^(.+?)\s+\^([a-zA-Z][\w-]*)\s*$/);
      if (blockMatch) {
        return `<p id="^${blockMatch[2]}">${blockMatch[1]}</p>`;
      }
      return `<p>${line}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

/** Resolves note id from link target using name map */
export function resolveNoteId(
  target: string,
  nameToId: Map<string, string>
): string | undefined {
  const normalized = normalizeLinkTarget(target).toLowerCase();
  return (
    nameToId.get(normalized) ??
    nameToId.get(normalized.replace(/\.md$/, ""))
  );
}

/** Finds linked backlinks — notes with [[wiki-links]] or ![[embeds]] to the target */
export function findLinkedBacklinks(
  noteName: string,
  allNotes: { id: string; path: string; name: string; content: string }[]
): BacklinkEntry[] {
  const results: BacklinkEntry[] = [];
  const target = noteName.replace(/\.md$/, "");
  const seen = new Set<string>();

  for (const note of allNotes) {
    if (note.name.replace(/\.md$/, "") === target) continue;

    const hasLink = extractWikiLinks(note.content).some(
      (l) => l.toLowerCase() === target.toLowerCase()
    );
    const hasEmbed = extractWikiEmbeds(note.content).some(
      (l) => l.toLowerCase() === target.toLowerCase()
    );

    if (hasLink || hasEmbed) {
      if (seen.has(note.id)) continue;
      seen.add(note.id);

      const contextLine =
        note.content.split("\n").find(
          (l) => l.includes(`[[${target}`) || l.includes(`![[${target}`)
        ) ?? "";

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

    const linkedTargets = [
      ...extractWikiLinks(note.content),
      ...extractWikiEmbeds(note.content),
    ].map((l) => l.toLowerCase());
    if (linkedTargets.includes(target.toLowerCase())) continue;

    const mentionLine = note.content.split("\n").find((line) => {
      if (!pattern.test(line)) return false;
      if (line.includes(`[[${target}`) || line.includes(`![[${target}`)) return false;
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

/** Extracts link target from a backlink context line for navigation */
export function extractLinkFromContext(context: string, noteName: string): string | null {
  const target = noteName.replace(/\.md$/, "");
  const wikiMatch = context.match(/\[\[([^\]|]+(?:#[^\]|]+)?)(?:\|[^\]]+)?\]\]/);
  if (wikiMatch && normalizeLinkTarget(wikiMatch[1]).toLowerCase() === target.toLowerCase()) {
    return wikiMatch[1];
  }
  const embedMatch = context.match(/!\[\[([^\]|]+(?:#[^\]|]+)?)(?:\|[^\]]+)?\]\]/);
  if (embedMatch && normalizeLinkTarget(embedMatch[1]).toLowerCase() === target.toLowerCase()) {
    return embedMatch[1];
  }
  return null;
}
