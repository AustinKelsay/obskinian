/**
 * Workspace layout persistence — saves and restores sidebar/tab state.
 */

import type { LeftPanel, RightPanel } from "@/lib/vault/types";

const WORKSPACE_KEY = "obskinian-workspace";

/** Serializable workspace snapshot */
export interface WorkspaceSnapshot {
  leftPanel: LeftPanel;
  rightPanel: RightPanel;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  openTabFileIds: string[];
  activeTabFileId: string | null;
}

/** Loads workspace snapshot from localStorage */
export function loadWorkspace(): WorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WORKSPACE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkspaceSnapshot;
  } catch {
    return null;
  }
}

/** Persists workspace snapshot to localStorage */
export function saveWorkspace(snapshot: WorkspaceSnapshot): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WORKSPACE_KEY, JSON.stringify(snapshot));
}

/** Builds snapshot from current store fields */
export function buildWorkspaceSnapshot(state: {
  leftPanel: LeftPanel;
  rightPanel: RightPanel;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  tabs: { fileId: string; id: string }[];
  activeTabId: string | null;
}): WorkspaceSnapshot {
  const activeTab = state.tabs.find((t) => t.id === state.activeTabId);
  return {
    leftPanel: state.leftPanel,
    rightPanel: state.rightPanel,
    isLeftSidebarOpen: state.isLeftSidebarOpen,
    isRightSidebarOpen: state.isRightSidebarOpen,
    openTabFileIds: state.tabs.map((t) => t.fileId),
    activeTabFileId: activeTab?.fileId ?? null,
  };
}
