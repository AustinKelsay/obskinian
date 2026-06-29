/**
 * Slash command definitions for the WYSIWYG and source editors.
 */

import type { Editor } from "@tiptap/react";

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  /** Markdown inserted in source mode */
  markdown: string;
  /** TipTap chain command key */
  tiptapAction?: string;
}

/** Available slash commands matching Obsidian-style shortcuts */
export const SLASH_COMMANDS: SlashCommand[] = [
  { id: "h1", label: "Heading 1", description: "Large section heading", markdown: "# ", tiptapAction: "heading1" },
  { id: "h2", label: "Heading 2", description: "Medium section heading", markdown: "## ", tiptapAction: "heading2" },
  { id: "h3", label: "Heading 3", description: "Small section heading", markdown: "### ", tiptapAction: "heading3" },
  { id: "bullet", label: "Bullet list", description: "Unordered list", markdown: "- ", tiptapAction: "bulletList" },
  { id: "numbered", label: "Numbered list", description: "Ordered list", markdown: "1. ", tiptapAction: "orderedList" },
  { id: "todo", label: "Todo", description: "Task list item", markdown: "- [ ] ", tiptapAction: "taskList" },
  { id: "quote", label: "Quote", description: "Blockquote", markdown: "> ", tiptapAction: "blockquote" },
  { id: "code", label: "Code block", description: "Fenced code block", markdown: "```\n\n```", tiptapAction: "codeBlock" },
  { id: "divider", label: "Divider", description: "Horizontal rule", markdown: "---\n", tiptapAction: "horizontalRule" },
  { id: "bold", label: "Bold", description: "Bold text", markdown: "**bold**", tiptapAction: "bold" },
  { id: "italic", label: "Italic", description: "Italic text", markdown: "*italic*", tiptapAction: "italic" },
  { id: "link", label: "Wiki link", description: "Link to another note", markdown: "[[]]", tiptapAction: "wikiLink" },
];

/** Filters slash commands by query string */
export function filterSlashCommands(query: string): SlashCommand[] {
  if (!query) return SLASH_COMMANDS;
  const lower = query.toLowerCase();
  return SLASH_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(lower) ||
      c.id.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
  );
}

/** Removes slash trigger text before cursor in TipTap editor */
export function deleteSlashTrigger(editor: Editor): void {
  const { from } = editor.state.selection;
  const text = editor.state.doc.textBetween(Math.max(0, from - 30), from);
  const match = text.match(/\/(\w*)$/);
  if (match) {
    editor.chain().focus().deleteRange({ from: from - match[0].length, to: from }).run();
  }
}

/** Applies a slash command to a TipTap editor instance */
export function applyTiptapSlashCommand(editor: Editor, cmd: SlashCommand): void {
  deleteSlashTrigger(editor);
  const chain = editor.chain().focus();

  switch (cmd.tiptapAction) {
    case "heading1":
      chain.toggleHeading({ level: 1 }).run();
      break;
    case "heading2":
      chain.toggleHeading({ level: 2 }).run();
      break;
    case "heading3":
      chain.toggleHeading({ level: 3 }).run();
      break;
    case "bulletList":
      chain.toggleBulletList().run();
      break;
    case "orderedList":
      chain.toggleOrderedList().run();
      break;
    case "taskList":
      chain.toggleTaskList().run();
      break;
    case "blockquote":
      chain.toggleBlockquote().run();
      break;
    case "codeBlock":
      chain.toggleCodeBlock().run();
      break;
    case "horizontalRule":
      chain.setHorizontalRule().run();
      break;
    case "bold":
      chain.toggleBold().run();
      break;
    case "italic":
      chain.toggleItalic().run();
      break;
    case "wikiLink":
      chain.insertContent("[[ ]]").run();
      break;
    default:
      break;
  }
}

/** Detects slash command trigger at cursor; returns query or null */
export function detectSlashQuery(textBeforeCursor: string): string | null {
  const match = textBeforeCursor.match(/(?:^|\s)\/(\w*)$/);
  if (!match) return null;
  return match[1];
}

/** Applies a slash command in source mode by replacing the trigger text */
export function applySourceSlashCommand(
  value: string,
  cursorPos: number,
  cmd: SlashCommand
): { value: string; cursorPos: number } {
  const textBefore = value.substring(0, cursorPos);
  const match = textBefore.match(/\/(\w*)$/);
  if (!match) {
    const before = value.substring(0, cursorPos);
    const after = value.substring(cursorPos);
    const inserted = cmd.markdown;
    return { value: before + inserted + after, cursorPos: cursorPos + inserted.length };
  }

  const start = cursorPos - match[0].length;
  const before = value.substring(0, start);
  const after = value.substring(cursorPos);
  const inserted = cmd.markdown;
  return { value: before + inserted + after, cursorPos: start + inserted.length };
}
