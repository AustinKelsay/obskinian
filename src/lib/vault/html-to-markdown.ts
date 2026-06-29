/**
 * Converts TipTap HTML output back to markdown for vault storage.
 * Handles common block and inline elements used in the editor.
 */

/** Converts an HTML string from TipTap into markdown */
export function htmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") return "";

  const doc = new DOMParser().parseFromString(html, "text/html");
  return serializeNodes(doc.body.childNodes).trim();
}

/** Recursively serializes DOM nodes to markdown */
function serializeNodes(nodes: NodeListOf<ChildNode>): string {
  const parts: string[] = [];
  for (const node of nodes) {
    const md = serializeNode(node);
    if (md) parts.push(md);
  }
  return parts.join("\n\n");
}

/** Serializes a single DOM node to markdown */
function serializeNode(node: ChildNode): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").trim();
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const children = serializeInline(el.childNodes);

  switch (tag) {
    case "h1":
      return serializeHeading(el, 1);
    case "h2":
      return serializeHeading(el, 2);
    case "h3":
      return serializeHeading(el, 3);
    case "h4":
      return serializeHeading(el, 4);
    case "h5":
      return serializeHeading(el, 5);
    case "h6":
      return serializeHeading(el, 6);
    case "p": {
      const blockId = el.getAttribute("id");
      const text = children;
      if (blockId?.startsWith("^")) return `${text} ${blockId}`;
      return text;
    }
    case "strong":
    case "b":
      return `**${children}**`;
    case "em":
    case "i":
      return `*${children}*`;
    case "s":
    case "del":
      return `~~${children}~~`;
    case "u":
      return children;
    case "code":
      if (el.parentElement?.tagName.toLowerCase() === "pre") return children;
      return `\`${children}\``;
    case "pre":
      return "```\n" + el.textContent?.trim() + "\n```";
    case "blockquote":
      return el.textContent
        ?.trim()
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n") ?? "";
    case "div": {
      if (el.classList.contains("callout")) {
        const type = el.getAttribute("data-callout-type") ?? "note";
        const title = el.querySelector(".callout-title")?.textContent?.trim() ?? "";
        const contentLines =
          el.querySelector(".callout-content")?.textContent?.trim().split("\n") ?? [];
        const header = title ? `[!${type}] ${title}` : `[!${type}]`;
        return [`> ${header}`, ...contentLines.filter(Boolean).map((l) => `> ${l}`)].join("\n");
      }
      if (el.classList.contains("wiki-embed")) {
        const target = el.getAttribute("data-target") ?? "";
        return `![[${target}]]`;
      }
      return serializeNodes(el.childNodes);
    }
    case "hr":
      return "---";
    case "a": {
      const href = el.getAttribute("href") ?? "";
      return `[${children}](${href})`;
    }
    case "span":
      if (el.classList.contains("wiki-link")) {
        const target = el.getAttribute("data-target") ?? children;
        const alias = el.getAttribute("data-alias");
        if (alias) return `[[${target}|${alias}]]`;
        return `[[${target}]]`;
      }
      return children;
    case "img":
      if (el.classList.contains("wiki-image")) {
        const assetPath = el.getAttribute("data-path") ?? el.getAttribute("alt") ?? "";
        return `![[${assetPath}]]`;
      }
      return children;
    case "ul":
      if (el.getAttribute("data-type") === "taskList") {
        return serializeTaskList(el);
      }
      return serializeListItems(el, "-");
    case "ol":
      return serializeListItems(el, "1.");
    case "li":
      return serializeListItem(el);
    default:
      return serializeNodes(el.childNodes);
  }
}

/** Serializes a heading, preserving block id suffix if present */
function serializeHeading(el: HTMLElement, level: number): string {
  const marks = "#".repeat(level);
  const blockId = el.getAttribute("id");
  const text = serializeInline(el.childNodes);
  if (blockId?.startsWith("^")) return `${marks} ${text} ${blockId}`;
  return `${marks} ${text}`;
}

/** Serializes a list item with optional block id */
function serializeListItem(li: HTMLElement): string {
  const blockId = li.getAttribute("id");
  const text = serializeInline(li.childNodes);
  if (blockId?.startsWith("^")) return `- ${text} ${blockId}`;
  return `- ${text}`;
}

/** Serializes inline child nodes */
function serializeInline(nodes: NodeListOf<ChildNode>): string {
  let result = "";
  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      result += serializeNode(node);
    }
  }
  return result.trim();
}

/** Serializes a bullet or ordered list */
function serializeListItems(ul: HTMLElement, marker: string): string {
  const items: string[] = [];
  let index = 1;
  for (const li of ul.children) {
    const prefix = marker === "1." ? `${index}.` : "-";
    items.push(`${prefix} ${serializeInline(li.childNodes)}`);
    index += 1;
  }
  return items.join("\n");
}

/** Serializes TipTap task list items */
function serializeTaskList(ul: HTMLElement): string {
  const items: string[] = [];
  for (const li of ul.querySelectorAll('[data-type="taskItem"]')) {
    const checked = li.getAttribute("data-checked") === "true";
    const text = li.querySelector("div")?.textContent?.trim() ?? "";
    items.push(`- [${checked ? "x" : " "}] ${text}`);
  }
  return items.join("\n");
}
