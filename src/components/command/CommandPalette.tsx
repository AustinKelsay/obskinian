/**
 * Obsidian-style command palette for quick navigation and actions.
 * Supports fuzzy search, recent files, and grouped commands.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  FileText,
  Zap,
  Share2,
  Plus,
  Trash2,
  Code,
  Calendar,
  Clock,
  FolderPlus,
  LayoutTemplate,
  Settings,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fuzzyMatch, fuzzySort } from "@/lib/fuzzy-match";
import { loadPreferences } from "@/lib/preferences";
import { openDailyNote } from "@/lib/plugins/daily-notes";
import { pluginRegistry } from "@/lib/plugins/registry";
import { useVaultStore } from "@/lib/vault/vault-store";
import { getFileDisplayName } from "@/lib/utils";
import { cycleEditorMode } from "@/lib/markdown/pipeline";
import { downloadNoteAsHtml } from "@/lib/export";
import type { VaultFile } from "@/lib/vault/types";

interface PaletteItem {
  id: string;
  label: string;
  subtitle?: string;
  group: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
}

/** Scores a vault file against a query using name and path */
function scoreFileMatch(file: VaultFile, query: string): number {
  return Math.max(
    fuzzyMatch(query, getFileDisplayName(file.path)),
    fuzzyMatch(query, file.path)
  );
}

/** Modal command palette overlay */
export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    getAllFiles,
    openFile,
    createNote,
    createFolder,
    setLeftPanel,
    setViewMode,
    splitPane,
    activePaneId,
    panes,
    setPaneEditorMode,
    getActiveFile,
    recentFileIds,
    setTemplatePickerOpen,
  } = useVaultStore();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const files = getAllFiles();
  const activeFile = getActiveFile();
  const activePane = panes.find((p) => p.id === activePaneId);
  const prefs = loadPreferences();

  const commands: PaletteItem[] = useMemo(
    () => [
      { id: "new-note", label: "Create new note", group: "Notes", icon: Plus, action: () => createNote() },
      { id: "template", label: "Insert template", group: "Notes", icon: LayoutTemplate, action: () => setTemplatePickerOpen(true) },
      { id: "new-folder", label: "Create new folder", group: "Notes", icon: FolderPlus, action: () => createFolder() },
      { id: "daily-note", label: "Open today's daily note", group: "Notes", icon: Calendar, action: () => openDailyNote() },
      { id: "graph", label: "Open graph view", group: "Views", icon: Share2, action: () => { setLeftPanel("graph"); setViewMode("graph"); } },
      { id: "search", label: "Open search", group: "Views", icon: Search, action: () => setLeftPanel("search") },
      { id: "explorer", label: "Open file explorer", group: "Views", icon: FileText, action: () => setLeftPanel("explorer") },
      { id: "settings", label: "Open settings", group: "Views", icon: Settings, action: () => setLeftPanel("settings") },
      { id: "split-v", label: "Split pane vertically", group: "Pane", icon: Zap, action: () => splitPane("vertical") },
      { id: "split-h", label: "Split pane horizontally", group: "Pane", icon: Zap, action: () => splitPane("horizontal") },
      {
        id: "toggle-source",
        label: "Cycle editor mode (live / source / reading)",
        group: "Editor",
        icon: Code,
        action: () => {
          const pane = panes.find((p) => p.id === activePaneId);
          setPaneEditorMode(activePaneId, cycleEditorMode(pane?.editorMode ?? "live"));
        },
      },
      ...(activeFile
        ? [
            {
              id: "export-html",
              label: "Export note as HTML",
              group: "Notes",
              icon: Download,
              action: () => downloadNoteAsHtml(activeFile.path, activeFile.content),
            },
            {
              id: "delete-note",
              label: `Delete "${activeFile.name.replace(".md", "")}"`,
              group: "Notes",
              icon: Trash2,
              action: () => useVaultStore.getState().deleteFile(activeFile.id),
            },
          ]
        : []),
    ],
    [activeFile, activePane, activePaneId, createNote, createFolder, setLeftPanel, setViewMode, splitPane, setPaneEditorMode, setTemplatePickerOpen]
  );

  const recentItems: PaletteItem[] = useMemo(() => {
    if (!prefs.showRecentInPalette || query.trim()) return [];
    return recentFileIds
      .map((id) => files.find((f) => f.id === id))
      .filter(Boolean)
      .slice(0, 5)
      .map((f) => ({
        id: `recent-${f!.id}`,
        label: getFileDisplayName(f!.path),
        group: "Recent",
        icon: Clock,
        action: () => openFile(f!.id),
      }));
  }, [recentFileIds, files, query, prefs.showRecentInPalette, openFile]);

  const fileItems: PaletteItem[] = useMemo(() => {
    const matched = query.trim()
      ? [...files]
          .map((f) => ({ file: f, score: scoreFileMatch(f, query) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .map(({ file }) => file)
      : files;

    return matched.slice(0, 10).map((f) => {
      const folderPath = f.path.includes("/") ? f.path.replace(/\/[^/]+$/, "") : "";
      return {
        id: `file-${f.id}`,
        label: getFileDisplayName(f.path),
        subtitle: folderPath || undefined,
        group: "Notes",
        icon: FileText,
        action: () => openFile(f.id),
      };
    });
  }, [files, query, openFile]);

  const filteredCommands = useMemo(
    () => (query.trim() ? fuzzySort(commands, query, (c) => c.label) : commands),
    [commands, query]
  );

  const pluginCommands: PaletteItem[] = useMemo(
    () =>
      pluginRegistry.getCommands().map((cmd) => ({
        id: `plugin-${cmd.id}`,
        label: cmd.label,
        group: cmd.group || "Plugins",
        icon: Zap,
        action: cmd.action,
      })),
    []
  );

  const filteredPlugins = useMemo(
    () => (query.trim() ? fuzzySort(pluginCommands, query, (c) => c.label) : pluginCommands),
    [pluginCommands, query]
  );

  const allItems = useMemo(() => {
    if (query.trim()) return [...filteredCommands, ...filteredPlugins, ...fileItems];
    return [...recentItems, ...filteredCommands, ...filteredPlugins, ...fileItems.slice(0, 5)];
  }, [query, recentItems, filteredCommands, filteredPlugins, fileItems]);

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

  function execute(item: PaletteItem) {
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

  let lastGroup = "";

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
            const showHeader = item.group !== lastGroup;
            lastGroup = item.group;

            return (
              <div key={item.id}>
                {showHeader && (
                  <div className="px-4 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-obs-text-faint">
                    {item.group}
                  </div>
                )}
                <button
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
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px]">{item.label}</span>
                    {item.subtitle && (
                      <span className="truncate text-[11px] text-obs-text-faint">{item.subtitle}</span>
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
