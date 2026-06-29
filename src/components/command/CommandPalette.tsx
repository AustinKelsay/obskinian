/**
 * Obsidian-style command palette for quick navigation and actions.
 * Opens with Ctrl/Cmd+P and supports fuzzy search over notes and commands.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, FileText, Zap, Share2, Plus, Trash2, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault/vault-store";

/** Modal command palette overlay */
export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    getAllFiles,
    openFile,
    createNote,
    setLeftPanel,
    setViewMode,
    splitPane,
    activePaneId,
    panes,
    setPaneEditorMode,
    getActiveFile,
  } = useVaultStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = getAllFiles();
  const activeFile = getActiveFile();
  const activePane = panes.find((p) => p.id === activePaneId);

  const commands = useMemo(
    () => [
      { id: "new-note", label: "Create new note", group: "Notes", icon: Plus, action: () => createNote() },
      { id: "graph", label: "Open graph view", group: "Views", icon: Share2, action: () => { setLeftPanel("graph"); setViewMode("graph"); } },
      { id: "search", label: "Open search", group: "Views", icon: Search, action: () => setLeftPanel("search") },
      { id: "explorer", label: "Open file explorer", group: "Views", icon: FileText, action: () => setLeftPanel("explorer") },
      { id: "split-v", label: "Split pane vertically", group: "Pane", icon: Zap, action: () => splitPane("vertical") },
      { id: "split-h", label: "Split pane horizontally", group: "Pane", icon: Zap, action: () => splitPane("horizontal") },
      {
        id: "toggle-source",
        label: activePane?.editorMode === "source" ? "Switch to live preview" : "Switch to source mode",
        group: "Editor",
        icon: Code,
        action: () => setPaneEditorMode(activePaneId, activePane?.editorMode === "source" ? "live" : "source"),
      },
      ...(activeFile
        ? [{
            id: "delete-note",
            label: `Delete "${activeFile.name.replace(".md", "")}"`,
            group: "Notes",
            icon: Trash2,
            action: () => useVaultStore.getState().deleteFile(activeFile.id),
          }]
        : []),
    ],
    [activeFile, activePane, activePaneId, createNote, setLeftPanel, setViewMode, splitPane, setPaneEditorMode]
  );

  const fileItems = useMemo(
    () =>
      files
        .filter((f) => {
          if (!query.trim()) return true;
          return f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.content.toLowerCase().includes(query.toLowerCase());
        })
        .slice(0, 8)
        .map((f) => ({
          id: `file-${f.id}`,
          label: f.name.replace(".md", ""),
          group: "Notes",
          icon: FileText,
          action: () => openFile(f.id),
        })),
    [files, query, openFile]
  );

  const filteredCommands = useMemo(
    () =>
      commands.filter((c) => {
        if (!query.trim()) return true;
        return c.label.toLowerCase().includes(query.toLowerCase());
      }),
    [commands, query]
  );

  const allItems = useMemo(
    () => [...filteredCommands, ...fileItems],
    [filteredCommands, fileItems]
  );

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isCommandPaletteOpen) return null;

  function execute(item: (typeof allItems)[0]) {
    item.action();
    setCommandPaletteOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setCommandPaletteOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && allItems[selectedIndex]) {
      e.preventDefault();
      execute(allItems[selectedIndex]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[15vh]"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-[520px] overflow-hidden rounded-lg border border-obs-border bg-obs-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-obs-border px-4 py-3">
          <Search size={16} className="shrink-0 text-obs-text-faint" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search notes..."
            className="w-full bg-transparent text-[14px] text-obs-text outline-none placeholder:text-obs-text-faint"
          />
          <kbd className="rounded border border-obs-border px-1.5 py-0.5 text-[10px] text-obs-text-faint">
            esc
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto py-1">
          {allItems.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-obs-text-faint">No results</p>
          )}
          {allItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 px-4 py-2 text-left transition-colors",
                  index === selectedIndex
                    ? "bg-obs-accent/20 text-obs-text"
                    : "text-obs-text-muted hover:bg-obs-interactive-hover"
                )}
                onClick={() => execute(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Icon size={15} className="shrink-0 text-obs-text-faint" />
                <span className="flex-1 truncate text-[13px]">{item.label}</span>
                <span className="text-[11px] text-obs-text-faint">{item.group}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
