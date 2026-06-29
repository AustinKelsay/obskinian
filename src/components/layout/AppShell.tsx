/**
 * Main application shell composing all Obsidian UI regions.
 * Layout: Ribbon | Left Sidebar | Main Content | Right Sidebar | Status Bar
 */

"use client";

import { useEffect, useMemo } from "react";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { Ribbon } from "./Ribbon";
import { TabBar } from "./TabBar";
import { StatusBar } from "./StatusBar";
import { RightSidebar } from "./RightSidebar";
import { ResizablePanel } from "./ResizablePanel";
import { FileExplorer } from "@/components/explorer/FileExplorer";
import { SearchPanel } from "@/components/search/SearchPanel";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { GraphView } from "@/components/graph/GraphView";
import { EditorArea } from "@/components/editor/EditorArea";
import { CommandPalette } from "@/components/command/CommandPalette";
import { useVaultStore, initializeVault } from "@/lib/vault/vault-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { registerBuiltinPlugins } from "@/lib/plugins/registry";
import { openDailyNote } from "@/lib/plugins/daily-notes";

/** Root layout shell matching Obsidian's workspace structure */
export function AppShell() {
  const {
    leftPanel,
    isLeftSidebarOpen,
    isRightSidebarOpen,
    viewMode,
    toggleLeftSidebar,
    toggleRightSidebar,
    panes,
    getPaneFile,
    setCommandPaletteOpen,
    createNote,
    closeTab,
    activeTabId,
    tabs,
    setLeftPanel,
    setViewMode,
    activePaneId,
    panes: paneList,
    setPaneEditorMode,
  } = useVaultStore();

  const hasPaneContent = panes.some((p) => getPaneFile(p.id) !== null);

  useEffect(() => {
    registerBuiltinPlugins();
    initializeVault();
  }, []);

  const shortcuts = useMemo(
    () => ({
      onCommandPalette: () => setCommandPaletteOpen(true),
      onToggleSource: () => {
        const pane = paneList.find((p) => p.id === activePaneId);
        setPaneEditorMode(activePaneId, pane?.editorMode === "source" ? "live" : "source");
      },
      onCloseTab: () => {
        if (activeTabId) closeTab(activeTabId);
      },
      onNewNote: () => createNote(),
      onToggleGraph: () => {
        setLeftPanel("graph");
        setViewMode("graph");
      },
      onToggleSearch: () => setLeftPanel("search"),
      onDailyNote: () => openDailyNote(),
    }),
    [
      setCommandPaletteOpen,
      activePaneId,
      paneList,
      setPaneEditorMode,
      activeTabId,
      closeTab,
      createNote,
      setLeftPanel,
      setViewMode,
    ]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-obs-bg">
      <CommandPalette />

      <div className="flex flex-1 overflow-hidden">
        <Ribbon />

        {isLeftSidebarOpen && leftPanel !== "graph" && (
          <ResizablePanel side="left" className="border-r border-obs-border bg-obs-sidebar">
            {leftPanel === "explorer" && <FileExplorer />}
            {leftPanel === "search" && <SearchPanel />}
            {leftPanel === "settings" && <SettingsPanel />}
          </ResizablePanel>
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex h-[36px] shrink-0 items-center border-b border-obs-border bg-obs-bg-secondary">
            <button
              type="button"
              title="Toggle left sidebar"
              aria-label="Toggle left sidebar"
              onClick={toggleLeftSidebar}
              className="flex h-full w-9 items-center justify-center text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text"
            >
              <PanelLeftClose size={16} />
            </button>
            {viewMode === "editor" && <TabBar />}
            <div className="flex-1" />
            {!isRightSidebarOpen && (
              <button
                type="button"
                title="Toggle right sidebar"
                aria-label="Toggle right sidebar"
                onClick={toggleRightSidebar}
                className="flex h-full w-9 items-center justify-center text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text"
              >
                <PanelRightClose size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-1 overflow-hidden">
            {viewMode === "graph" ? (
              <GraphView />
            ) : hasPaneContent || tabs.length > 0 ? (
              <EditorArea />
            ) : (
              <EmptyState onCreateNote={() => createNote()} />
            )}
          </div>
        </div>

        <RightSidebar />
      </div>

      <StatusBar />
    </div>
  );
}

/** Shown when no note is open */
function EmptyState({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-obs-bg text-obs-text-muted">
      <div className="text-6xl opacity-20">◇</div>
      <div className="text-center">
        <p className="text-lg font-medium text-obs-text">No note open</p>
        <p className="mt-1 text-[13px] text-obs-text-faint">
          Select a note from the file explorer, or press{" "}
          <kbd className="rounded border border-obs-border px-1.5 py-0.5 text-[11px]">⌘P</kbd>{" "}
          to open the command palette
        </p>
      </div>
      <button
        type="button"
        onClick={onCreateNote}
        className="mt-2 rounded-md bg-obs-accent/20 px-4 py-2 text-[13px] text-obs-accent transition-colors hover:bg-obs-accent/30"
      >
        Create new note
      </button>
    </div>
  );
}
