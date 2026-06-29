/**
 * Raw markdown source editor with syntax-aware styling.
 * Provides Obsidian's source mode for direct markdown editing.
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault/vault-store";

interface SourceEditorProps {
  fileId: string;
  content: string;
}

/** Monospace markdown source editor */
export function SourceEditor({ fileId, content }: SourceEditorProps) {
  const updateContent = useVaultStore((s) => s.updateContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== content) {
      textareaRef.current.value = content;
    }
  }, [fileId, content]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateContent(fileId, e.target.value);
      }, 300);
    },
    [fileId, updateContent]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + "  " + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
    }
  }, []);

  return (
    <textarea
      ref={textareaRef}
      defaultValue={content}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      className={cn(
        "h-full w-full resize-none bg-obs-bg p-8 font-mono text-[13px] leading-relaxed text-obs-text outline-none",
        "max-w-[720px] mx-auto block"
      )}
      placeholder="Write markdown..."
    />
  );
}
