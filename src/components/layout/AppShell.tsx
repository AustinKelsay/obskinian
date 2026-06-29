/**
 * Main application shell composing all Obsidian UI regions.
 * Layout: Ribbon | Left Sidebar | Main Content | Right Sidebar | Status Bar
 */

"use client";

import { useEffect, useMemo } from "react";
import { PanelLeftClose, PanelLeftOpen, PanelRightOpen } from "lucide-react";
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
import { TemplatePicker } from "@/components/templates/TemplatePicker";
import { useVaultStore, initializeVault, subscribeWorkspacePersistence } from "@/lib/vault/vault-store";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useIsMobile } from "@/hooks/useIsMobile";
import { registerBuiltinPlugins } from "@/lib/plugins/registry";
import { openDailyNote } from "@/lib/plugins/daily-notes";
import { loadPreferences, applyCustomCss } from "@/lib/preferences";
import { applyTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { cycleEditorMode } from "@/lib/markdown/pipeline";

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

  const isMobile = useIsMobile();
  const hasPaneContent = panes.some((p) => getPaneFile(p.id) !== null);

  useEffect(() => {
    const prefs = loadPreferences();
    applyTheme({ mode: prefs.theme, accent: prefs.accent });
    applyCustomCss(prefs.customCss);
    registerBuiltinPlugins();
    initializeVault();
    const unsubscribe = subscribeWorkspacePersistence();
    return () => unsubscribe();
  }, []);

  const shortcuts = useMemo(
    () => ({
      onCommandPalette: () => setCommandPaletteOpen(true),
      onToggleSource: () => {
        const pane = paneList.find((p) => p.id === activePaneId);
        const next = cycleEditorMode(pane?.editorMode ?? "live");
        setPaneEditorMode(activePaneId, next);
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
      <TemplatePicker />

      <div className="relative flex flex-1 overflow-hidden">
        <Ribbon />

        {isMobile && (isLeftSidebarOpen || isRightSidebarOpen) && (
          <div
            className="obs-modal-overlay absolute inset-0 z-20 md:hidden"
            onClick={() => {
              if (isLeftSidebarOpen) toggleLeftSidebar();
              if (isRightSidebarOpen) toggleRightSidebar();
            }}
          />
        )}

        {isLeftSidebarOpen && leftPanel !== "graph" && (
          <ResizablePanel
            side="left"
            defaultWidth={260}
            storageKey="obskinian-left-sidebar"
            className={cn(
              "z-30 border-r border-obs-border bg-obs-sidebar",
              isMobile && "absolute inset-y-0 left-[44px] shadow-xl"
            )}
          >
            {leftPanel === "explorer" && <FileExplorer />}
            {leftPanel === "search" && <SearchPanel />}
            {leftPanel === "settings" && <SettingsPanel />}
          </ResizablePanel>
        )}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-[36px] shrink-0 items-center border-b border-obs-border bg-obs-bg-secondary">
            <button
              type="button"
              title={isLeftSidebarOpen ? "Hide left sidebar" : "Show left sidebar"}
              aria-label={isLeftSidebarOpen ? "Hide left sidebar" : "Show left sidebar"}
              onClick={toggleLeftSidebar}
              className="flex h-full w-9 items-center justify-center text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-obs-accent"
            >
              {isLeftSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            {viewMode === "editor" && <TabBar />}
            {viewMode === "graph" && (
              <span className="px-2 text-[12px] text-obs-text-muted">Graph view</span>
            )}
            <div className="flex-1" />
            {!isRightSidebarOpen && (
              <button
                type="button"
                title="Show right sidebar"
                aria-label="Show right sidebar"
                onClick={toggleRightSidebar}
                className="flex h-full w-9 items-center justify-center text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-obs-accent"
              >
                <PanelRightOpen size={16} />
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

        {isRightSidebarOpen && (
          <ResizablePanel
            side="right"
            defaultWidth={280}
            minWidth={220}
            storageKey="obskinian-right-sidebar"
            className={cn(
              "z-30 bg-obs-sidebar",
              isMobile && "absolute inset-y-0 right-0 shadow-xl"
            )}
          >
            <RightSidebar className="h-full w-full" />
          </ResizablePanel>
        )}
      </div>

      <StatusBar />
    </div>
  );
}

/** Shown when no note is open */
function EmptyState({ onCreateNote }: { onCreateNote: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-obs-bg px-6 text-center">
      <p className="text-[14px] text-obs-text-muted">No note is open.</p>
      <p className="max-w-sm text-[13px] leading-relaxed text-obs-text-faint">
        Open a note from the file explorer, or press{" "}
        <kbd className="rounded-sm border border-obs-border px-1.5 py-0.5 text-[11px] text-obs-text-muted">
          ⌘P
        </kbd>{" "}
        for the command palette.
      </p>
      <button
        type="button"
        onClick={onCreateNote}
        className="mt-1 rounded-sm bg-obs-interactive px-3 py-1.5 text-[13px] text-obs-text transition-colors hover:bg-obs-interactive-hover"
      >
        Create new note
      </button>
    </div>
  );
}
