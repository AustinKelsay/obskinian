/**
 * Wiki-link and markdown link parsing utilities.
 * Extracts [[wiki-links]] and standard markdown links from note content.
 */

/** Extracts all [[wiki-link]] targets from markdown content */
export function extractWikiLinks(content: string): string[] {
  const links: string[] = [];
  const regex = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return links;
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

/** Converts markdown to basic HTML for TipTap initial content */
export function markdownToHtml(md: string): string {
  let html = md;

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
    /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,
    (_, target, alias) =>
      `<span class="wiki-link" data-target="${escapeHtml(target.trim())}">${escapeHtml(alias ?? target.trim())}</span>`
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
      if (/^<(h[1-6]|ul|ol|li|blockquote|pre|hr|p)/.test(trimmed)) return line;
      return `<p>${line}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return html;
}

/** Finds backlinks — notes that link to the given note name */
export function findBacklinks(
  noteName: string,
  allNotes: { id: string; path: string; name: string; content: string }[]
): { fileId: string; filePath: string; fileName: string; context: string }[] {
  const results: { fileId: string; filePath: string; fileName: string; context: string }[] = [];
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
      });
    }
  }
  return results;
}
