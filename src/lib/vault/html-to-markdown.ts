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
      return `# ${children}`;
    case "h2":
      return `## ${children}`;
    case "h3":
      return `### ${children}`;
    case "h4":
      return `#### ${children}`;
    case "h5":
      return `##### ${children}`;
    case "h6":
      return `###### ${children}`;
    case "p":
      return children;
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
    case "hr":
      return "---";
    case "a": {
      const href = el.getAttribute("href") ?? "";
      return `[${children}](${href})`;
    }
    case "span":
      if (el.classList.contains("wiki-link")) {
        const target = el.getAttribute("data-target") ?? children;
        return `[[${target}]]`;
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
      return `- ${serializeInline(el.childNodes)}`;
    default:
      return serializeNodes(el.childNodes);
  }
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
