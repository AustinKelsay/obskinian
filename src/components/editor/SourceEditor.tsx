/**
 * Raw markdown source editor with syntax-aware styling.
 * Provides Obsidian's source mode for direct markdown editing.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault/vault-store";
import { serializeNote } from "@/lib/vault/frontmatter";
import type { FrontmatterValue } from "@/lib/vault/frontmatter";
import { SlashCommandMenu } from "./SlashCommandMenu";
import {
  applySourceSlashCommand,
  detectSlashQuery,
  filterSlashCommands,
  type SlashCommand,
} from "@/lib/editor/slash-commands";

interface SourceEditorProps {
  fileId: string;
  content: string;
  frontmatter?: Record<string, FrontmatterValue>;
  /** Full-width layout for split preview pane */
  layout?: "default" | "split";
  /** Shows a scroll-synced line number gutter */
  showLineNumbers?: boolean;
  /** Reports scroll ratio (0–1) for split preview sync */
  onScrollRatioChange?: (ratio: number) => void;
}

const LINE_HEIGHT = 1.625;

/** Monospace markdown source editor */
export function SourceEditor({
  fileId,
  content,
  frontmatter = {},
  layout = "default",
  showLineNumbers = false,
  onScrollRatioChange,
}: SourceEditorProps) {
  const updateFileRaw = useVaultStore((s) => s.updateFileRaw);
  const scrollToHeadingId = useVaultStore((s) => s.scrollToHeadingId);
  const scrollToBlockId = useVaultStore((s) => s.scrollToBlockId);
  const clearScrollToHeading = useVaultStore((s) => s.clearScrollToHeading);
  const clearScrollToBlock = useVaultStore((s) => s.clearScrollToBlock);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);
  const [lineCount, setLineCount] = useState(1);

  const slashCommands = filterSlashCommands(slashQuery);

  const rawContent = useMemo(
    () => serializeNote(frontmatter, content),
    [frontmatter, content]
  );

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== rawContent) {
      textareaRef.current.value = rawContent;
    }
    setLineCount(Math.max(1, rawContent.split("\n").length));
  }, [fileId, rawContent]);

  useEffect(() => {
    if (!scrollToHeadingId || !textareaRef.current) return;
    const lines = content.split("\n");
    const idx = lines.findIndex((line) => {
      const match = line.match(/^#{1,6}\s+(.+)$/);
      if (!match) return false;
      const id = match[1].replace(/\[\[|\]\]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return id === scrollToHeadingId;
    });
    if (idx >= 0) {
      textareaRef.current.scrollTop = idx * 13 * LINE_HEIGHT;
    }
    clearScrollToHeading();
  }, [scrollToHeadingId, content, clearScrollToHeading]);

  useEffect(() => {
    if (!scrollToBlockId || !textareaRef.current) return;
    const blockSuffix = scrollToBlockId.replace(/^\^/, "");
    const lines = rawContent.split("\n");
    const idx = lines.findIndex((line) => new RegExp(`\\^${blockSuffix}\\s*$`).test(line));
    if (idx >= 0) {
      textareaRef.current.scrollTop = idx * 13 * LINE_HEIGHT;
    }
    clearScrollToBlock();
  }, [scrollToBlockId, rawContent, clearScrollToBlock]);

  useEffect(() => {
    setSlashIndex(0);
  }, [slashQuery]);

  const syncGutterScroll = useCallback(() => {
    const ta = textareaRef.current;
    const gutter = gutterRef.current;
    if (!ta || !gutter) return;
    gutter.scrollTop = ta.scrollTop;
  }, []);

  const reportScrollRatio = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta || !onScrollRatioChange) return;
    const maxScroll = ta.scrollHeight - ta.clientHeight;
    const ratio = maxScroll > 0 ? ta.scrollTop / maxScroll : 0;
    onScrollRatioChange(ratio);
  }, [onScrollRatioChange]);

  const handleScroll = useCallback(() => {
    syncGutterScroll();
    reportScrollRatio();
  }, [syncGutterScroll, reportScrollRatio]);

  const detectSlash = useCallback((value: string, cursorPos: number) => {
    const textBefore = value.substring(0, cursorPos);
    const query = detectSlashQuery(textBefore);
    if (query !== null) {
      setSlashOpen(true);
      setSlashQuery(query);
    } else {
      setSlashOpen(false);
      setSlashQuery("");
    }
  }, []);

  const applySlash = useCallback(
    (cmd: SlashCommand) => {
      const ta = textareaRef.current;
      if (!ta) return;

      const { value, cursorPos } = applySourceSlashCommand(ta.value, ta.selectionStart, cmd);
      ta.value = value;
      ta.selectionStart = ta.selectionEnd = cursorPos;
      setLineCount(Math.max(1, value.split("\n").length));
      updateFileRaw(fileId, ta.value);
      setSlashOpen(false);
      setSlashQuery("");
      setSlashIndex(0);
    },
    [fileId, updateFileRaw]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLineCount(Math.max(1, e.target.value.split("\n").length));
      detectSlash(e.target.value, e.target.selectionStart);

      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateFileRaw(fileId, e.target.value);
      }, 300);
    },
    [fileId, updateFileRaw, detectSlash]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (slashOpen && slashCommands.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSlashIndex((i) => Math.min(i + 1, slashCommands.length - 1));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSlashIndex((i) => Math.max(i - 1, 0));
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          applySlash(slashCommands[slashIndex]);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setSlashOpen(false);
          setSlashQuery("");
          return;
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        const ta = e.currentTarget;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        ta.value = ta.value.substring(0, start) + "  " + ta.value.substring(end);
        ta.selectionStart = ta.selectionEnd = start + 2;
        setLineCount(Math.max(1, ta.value.split("\n").length));
      }
    },
    [slashOpen, slashCommands, slashIndex, applySlash]
  );

  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, index) => index + 1),
    [lineCount]
  );

  return (
    <div className="relative flex h-full overflow-hidden">
      {slashOpen && slashCommands.length > 0 && (
        <SlashCommandMenu
          commands={slashCommands}
          selectedIndex={slashIndex}
          onSelect={applySlash}
          onHover={setSlashIndex}
          position={{ top: 8, left: showLineNumbers ? 72 : 48 }}
        />
      )}

      {showLineNumbers && (
        <div
          ref={gutterRef}
          aria-hidden
          className="source-line-gutter shrink-0 overflow-hidden border-r border-obs-border bg-obs-bg-secondary py-8 pl-3 pr-2 text-right font-mono text-[11px] text-obs-text-faint select-none"
        >
          {lineNumbers.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
      )}

      <textarea
        ref={textareaRef}
        defaultValue={rawContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        spellCheck={false}
        className={cn(
          "source-editor-textarea h-full w-full resize-none bg-obs-bg py-8 font-mono text-[13px] text-obs-text outline-none",
          layout === "split" ? "px-4" : "max-w-[720px] mx-auto block px-8"
        )}
        placeholder="Write markdown... (type / for commands)"
      />
    </div>
  );
}
