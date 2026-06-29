/**
 * Main application shell composing all Obsidian UI regions.
 * Layout: Ribbon | Left Sidebar | Main Content | Right Sidebar | Status Bar
 */

"use client";

import { useEffect } from "react";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { Ribbon } from "./Ribbon";
import { TabBar } from "./TabBar";
import { StatusBar } from "./StatusBar";
import { RightSidebar } from "./RightSidebar";
import { FileExplorer } from "@/components/explorer/FileExplorer";
import { SearchPanel } from "@/components/search/SearchPanel";
import { GraphView } from "@/components/graph/GraphView";
import { WysiwygEditor } from "@/components/editor/WysiwygEditor";
import { useVaultStore, initializeVault } from "@/lib/vault/vault-store";

/** Root layout shell matching Obsidian's workspace structure */
export function AppShell() {
  const {
    leftPanel,
    isLeftSidebarOpen,
    isRightSidebarOpen,
    viewMode,
    toggleLeftSidebar,
    toggleRightSidebar,
    getActiveFile,
  } = useVaultStore();

  const activeFile = getActiveFile();

  useEffect(() => {
    initializeVault();
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-obs-bg">
      <div className="flex flex-1 overflow-hidden">
        <Ribbon />

        {isLeftSidebarOpen && leftPanel !== "graph" && (
          <div className="flex w-[260px] shrink-0 flex-col border-r border-obs-border bg-obs-sidebar">
            {leftPanel === "explorer" && <FileExplorer />}
            {leftPanel === "search" && <SearchPanel />}
          </div>
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
            ) : activeFile ? (
              <WysiwygEditor
                key={activeFile.id}
                fileId={activeFile.id}
                content={activeFile.content}
              />
            ) : (
              <EmptyState />
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
function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-obs-bg text-obs-text-muted">
      <div className="text-6xl opacity-20">◇</div>
      <div className="text-center">
        <p className="text-lg font-medium text-obs-text">No note open</p>
        <p className="mt-1 text-[13px] text-obs-text-faint">
          Select a note from the file explorer or search for one
        </p>
      </div>
    </div>
  );
}
