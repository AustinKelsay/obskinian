/**
 * Raw markdown source editor with syntax-aware styling.
 * Provides Obsidian's source mode for direct markdown editing.
 */

"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
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
}

/** Monospace markdown source editor */
export function SourceEditor({ fileId, content, frontmatter = {} }: SourceEditorProps) {
  const updateFileRaw = useVaultStore((s) => s.updateFileRaw);
  const scrollToHeadingId = useVaultStore((s) => s.scrollToHeadingId);
  const scrollToBlockId = useVaultStore((s) => s.scrollToBlockId);
  const clearScrollToHeading = useVaultStore((s) => s.clearScrollToHeading);
  const clearScrollToBlock = useVaultStore((s) => s.clearScrollToBlock);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [slashIndex, setSlashIndex] = useState(0);

  const slashCommands = filterSlashCommands(slashQuery);

  const rawContent = useMemo(
    () => serializeNote(frontmatter, content),
    [frontmatter, content]
  );

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== rawContent) {
      textareaRef.current.value = rawContent;
    }
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
      const lineHeight = 20;
      textareaRef.current.scrollTop = idx * lineHeight;
    }
    clearScrollToHeading();
  }, [scrollToHeadingId, content, clearScrollToHeading]);

  useEffect(() => {
    if (!scrollToBlockId || !textareaRef.current) return;
    const blockSuffix = scrollToBlockId.replace(/^\^/, "");
    const lines = rawContent.split("\n");
    const idx = lines.findIndex((line) => new RegExp(`\\^${blockSuffix}\\s*$`).test(line));
    if (idx >= 0) {
      textareaRef.current.scrollTop = idx * 20;
    }
    clearScrollToBlock();
  }, [scrollToBlockId, rawContent, clearScrollToBlock]);

  useEffect(() => {
    setSlashIndex(0);
  }, [slashQuery]);

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
      updateFileRaw(fileId, ta.value);
      setSlashOpen(false);
      setSlashQuery("");
      setSlashIndex(0);
    },
    [fileId, updateFileRaw]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      }
    },
    [slashOpen, slashCommands, slashIndex, applySlash]
  );

  return (
    <div className="relative h-full">
      {slashOpen && slashCommands.length > 0 && (
        <SlashCommandMenu
          commands={slashCommands}
          selectedIndex={slashIndex}
          onSelect={applySlash}
          onHover={setSlashIndex}
          position={{ top: 8, left: 48 }}
        />
      )}
      <textarea
        ref={textareaRef}
        defaultValue={rawContent}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={cn(
          "h-full w-full resize-none bg-obs-bg p-8 font-mono text-[13px] leading-relaxed text-obs-text outline-none",
          "max-w-[720px] mx-auto block"
        )}
        placeholder="Write markdown... (type / for commands)"
      />
    </div>
  );
}
