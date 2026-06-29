/**
 * Global keyboard shortcut handler for Obsidian-like keybindings.
 * Registers shortcuts for command palette, navigation, and editor actions.
 */

"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
  onCommandPalette?: () => void;
  onToggleSource?: () => void;
  onCloseTab?: () => void;
  onNewNote?: () => void;
  onToggleGraph?: () => void;
  onToggleSearch?: () => void;
}

/** Registers global keyboard shortcuts matching Obsidian defaults */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key === "p") {
        e.preventDefault();
        handlers.onCommandPalette?.();
        return;
      }

      if (mod && e.key === "e") {
        e.preventDefault();
        handlers.onToggleSource?.();
        return;
      }

      if (mod && e.key === "w") {
        e.preventDefault();
        handlers.onCloseTab?.();
        return;
      }

      if (mod && e.key === "n") {
        e.preventDefault();
        handlers.onNewNote?.();
        return;
      }

      if (mod && e.key === "g") {
        e.preventDefault();
        handlers.onToggleGraph?.();
        return;
      }

      if (mod && e.shiftKey && e.key === "f") {
        e.preventDefault();
        handlers.onToggleSearch?.();
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
