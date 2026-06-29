/**
 * WYSIWYG editor powered by TipTap.
 * Provides rich text editing with Obsidian-like styling and wiki-link support.
 */

"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { markdownToHtml, buildEmbedPreview } from "@/lib/vault/link-parser";
import { htmlToMarkdown } from "@/lib/vault/html-to-markdown";
import { useVaultStore } from "@/lib/vault/vault-store";
import { findFileByLink } from "@/lib/vault/vault-data";
import { SlashCommandMenu } from "./SlashCommandMenu";
import {
  applyTiptapSlashCommand,
  detectSlashQuery,
  filterSlashCommands,
  type SlashCommand,
} from "@/lib/editor/slash-commands";

interface WysiwygEditorProps {
  fileId: string;
  content: string;
  hideToolbar?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}

/** Single toolbar button with active state */
function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        isActive
          ? "bg-obs-accent/20 text-obs-accent"
          : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
      )}
    >
      {children}
    </button>
  );
}

/** Rich text WYSIWYG editor with formatting toolbar */
export function WysiwygEditor({ fileId, content, hideToolbar = false }: WysiwygEditorProps) {
  const updateContent = useVaultStore((s) => s.updateContent);
  const openFileByLink = useVaultStore((s) => s.openFileByLink);
  const vault = useVaultStore((s) => s.vault);
  const scrollToHeadingId = useVaultStore((s) => s.scrollToHeadingId);
  const clearScrollToHeading = useVaultStore((s) => s.clearScrollToHeading);

  const resolveEmbed = useCallback(
    (target: string) => {
      const file = findFileByLink(vault, target);
      if (!file) return null;
      return buildEmbedPreview(file.content);
    },
    [vault]
  );

  const initialHtml = markdownToHtml(content, { resolveEmbed });

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  const slashStateRef = useRef({
    open: false,
    index: 0,
    commands: [] as SlashCommand[],
    apply: (_: SlashCommand) => {},
  });

  const slashCommands = filterSlashCommands(slashQuery);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing... (type / for commands)" }),
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
      handleClick: (_view, _pos, event) => {
        const target = event.target as HTMLElement;
        const embedEl = target.closest(".wiki-embed") as HTMLElement | null;
        if (embedEl) {
          const linkTarget = embedEl.getAttribute("data-target");
          if (linkTarget) {
            openFileByLink(linkTarget);
            return true;
          }
        }
        if (target.classList.contains("wiki-link")) {
          const linkTarget = target.getAttribute("data-target");
          if (linkTarget) {
            openFileByLink(linkTarget);
            return true;
          }
        }
        return false;
      },
      handleKeyDown: (_view, event) => {
        const { open, index, commands, apply } = slashStateRef.current;
        if (!open || commands.length === 0) return false;

        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSlashIndex((i) => Math.min(i + 1, commands.length - 1));
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          setSlashIndex((i) => Math.max(i - 1, 0));
          return true;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          apply(commands[index]);
          return true;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          setSlashOpen(false);
          setSlashQuery("");
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => {
      updateContent(fileId, htmlToMarkdown(ed.getHTML()));

      const { from } = ed.state.selection;
      const textBefore = ed.state.doc.textBetween(Math.max(0, from - 50), from);
      const query = detectSlashQuery(textBefore);
      if (query !== null) {
        setSlashOpen(true);
        setSlashQuery(query);
      } else {
        setSlashOpen(false);
        setSlashQuery("");
      }
    },
  });

  const applySlash = useCallback(
    (cmd: SlashCommand) => {
      if (!editor) return;
      applyTiptapSlashCommand(editor, cmd);
      setSlashOpen(false);
      setSlashQuery("");
      setSlashIndex(0);
    },
    [editor]
  );

  useEffect(() => {
    slashStateRef.current = {
      open: slashOpen,
      index: slashIndex,
      commands: slashCommands,
      apply: applySlash,
    };
  }, [slashOpen, slashIndex, slashCommands, applySlash]);

  useEffect(() => {
    setSlashIndex(0);
  }, [slashQuery]);

  useEffect(() => {
    if (editor && content !== htmlToMarkdown(editor.getHTML())) {
      editor.commands.setContent(markdownToHtml(content, { resolveEmbed }));
    }
  }, [fileId, resolveEmbed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!scrollToHeadingId) return;
    const el = document.getElementById(scrollToHeadingId);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    clearScrollToHeading();
  }, [scrollToHeadingId, clearScrollToHeading]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex h-full flex-col">
      {!hideToolbar && (
      <div className="flex shrink-0 items-center gap-0.5 border-b border-obs-border bg-obs-bg-secondary px-2 py-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough size={15} />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-obs-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-obs-border" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code block"
        >
          <Code size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal rule"
        >
          <Minus size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
          <LinkIcon size={15} />
        </ToolbarButton>
      </div>
      )}

      <div className="relative flex-1 overflow-y-auto bg-obs-bg">
        {slashOpen && slashCommands.length > 0 && (
          <SlashCommandMenu
            commands={slashCommands}
            selectedIndex={slashIndex}
            onSelect={applySlash}
            onHover={setSlashIndex}
          />
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
