/**
 * Zustand store for global Obsidian clone application state.
 * Manages vault tree, open tabs, panel visibility, and view mode.
 */

import { create } from "zustand";
import type {
  EditorTab,
  GraphLink,
  GraphNode,
  LeftPanel,
  RightPanel,
  SearchResult,
  VaultFile,
  VaultFolder,
  ViewMode,
} from "./types";
import {
  buildVaultTree,
  findFileById,
  findFileByLink,
  flattenVaultFiles,
  toggleFolderExpanded,
  updateFileContent,
} from "./vault-data";
import { extractWikiLinks } from "./link-parser";
import { getFileDisplayName } from "../utils";

interface VaultStore {
  vault: VaultFolder;
  tabs: EditorTab[];
  activeTabId: string | null;
  leftPanel: LeftPanel;
  rightPanel: RightPanel;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  viewMode: ViewMode;
  searchQuery: string;
  searchResults: SearchResult[];
  graphFilter: string;

  openFile: (fileId: string) => void;
  openFileByLink: (link: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateContent: (fileId: string, content: string) => void;
  toggleFolder: (folderId: string) => void;
  setLeftPanel: (panel: LeftPanel) => void;
  setRightPanel: (panel: RightPanel) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setGraphFilter: (filter: string) => void;
  getActiveFile: () => VaultFile | null;
  getAllFiles: () => VaultFile[];
  getGraphData: () => { nodes: GraphNode[]; links: GraphLink[] };
}

let tabCounter = 0;

/** Creates the Zustand vault store with demo data */
export const useVaultStore = create<VaultStore>((set, get) => ({
  vault: buildVaultTree(),
  tabs: [],
  activeTabId: null,
  leftPanel: "explorer",
  rightPanel: "outline",
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  viewMode: "editor",
  searchQuery: "",
  searchResults: [],
  graphFilter: "",

  openFile: (fileId: string) => {
    const { vault, tabs } = get();
    const file = findFileById(vault, fileId);
    if (!file) return;

    const existing = tabs.find((t) => t.fileId === fileId);
    if (existing) {
      set({ activeTabId: existing.id, viewMode: "editor" });
      return;
    }

    tabCounter += 1;
    const tab: EditorTab = {
      id: `tab-${tabCounter}`,
      fileId: file.id,
      filePath: file.path,
      fileName: getFileDisplayName(file.path),
    };

    set({
      tabs: [...tabs, tab],
      activeTabId: tab.id,
      viewMode: "editor",
    });
  },

  openFileByLink: (link: string) => {
    const { vault } = get();
    const file = findFileByLink(vault, link);
    if (file) get().openFile(file.id);
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex((t) => t.id === tabId);
    if (idx === -1) return;

    const newTabs = tabs.filter((t) => t.id !== tabId);
    let newActiveId = activeTabId;

    if (activeTabId === tabId) {
      if (newTabs.length === 0) {
        newActiveId = null;
      } else {
        const newIdx = Math.min(idx, newTabs.length - 1);
        newActiveId = newTabs[newIdx].id;
      }
    }

    set({ tabs: newTabs, activeTabId: newActiveId });
  },

  setActiveTab: (tabId: string) => {
    set({ activeTabId: tabId, viewMode: "editor" });
  },

  updateContent: (fileId: string, content: string) => {
    set((state) => ({
      vault: updateFileContent(state.vault, fileId, content) as VaultFolder,
    }));
  },

  toggleFolder: (folderId: string) => {
    set((state) => ({
      vault: toggleFolderExpanded(state.vault, folderId) as VaultFolder,
    }));
  },

  setLeftPanel: (panel: LeftPanel) => {
    set((state) => {
      const isClosing = state.leftPanel === panel && panel !== "none";
      return {
        leftPanel: isClosing ? "none" : panel,
        isLeftSidebarOpen: !isClosing,
        viewMode: panel === "graph" && !isClosing ? "graph" : isClosing ? state.viewMode : panel === "graph" ? "graph" : "editor",
      };
    });
  },

  setRightPanel: (panel: RightPanel) => {
    set((state) => ({
      rightPanel: state.rightPanel === panel ? "none" : panel,
      isRightSidebarOpen: state.rightPanel === panel ? false : true,
    }));
  },

  toggleLeftSidebar: () => {
    set((state) => ({
      isLeftSidebarOpen: !state.isLeftSidebarOpen,
      leftPanel: !state.isLeftSidebarOpen ? "explorer" : "none",
    }));
  },

  toggleRightSidebar: () => {
    set((state) => ({
      isRightSidebarOpen: !state.isRightSidebarOpen,
      rightPanel: !state.isRightSidebarOpen ? "outline" : "none",
    }));
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
  },

  setSearchQuery: (query: string) => {
    const files = get().getAllFiles();
    const results: SearchResult[] = [];

    if (query.trim()) {
      const lower = query.toLowerCase();
      for (const file of files) {
        const nameMatch = file.name.toLowerCase().includes(lower);
        const contentMatch = file.content.toLowerCase().includes(lower);
        if (nameMatch || contentMatch) {
          const idx = file.content.toLowerCase().indexOf(lower);
          const start = Math.max(0, idx - 40);
          const end = Math.min(file.content.length, idx + query.length + 40);
          const snippet =
            (start > 0 ? "..." : "") +
            file.content.slice(start, end) +
            (end < file.content.length ? "..." : "");

          results.push({
            fileId: file.id,
            filePath: file.path,
            fileName: getFileDisplayName(file.path),
            snippet,
            matchIndex: idx,
          });
        }
      }
    }

    set({ searchQuery: query, searchResults: results });
  },

  setGraphFilter: (filter: string) => {
    set({ graphFilter: filter });
  },

  getActiveFile: () => {
    const { vault, tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return null;
    return findFileById(vault, tab.fileId);
  },

  getAllFiles: () => {
    return flattenVaultFiles(get().vault);
  },

  getGraphData: () => {
    const files = get().getAllFiles();
    const nodes: GraphNode[] = files.map((f) => ({
      id: f.id,
      name: getFileDisplayName(f.path),
      path: f.path,
      val: 1 + extractWikiLinks(f.content).length * 0.5,
    }));

    const nameToId = new Map<string, string>();
    for (const f of files) {
      nameToId.set(getFileDisplayName(f.path).toLowerCase(), f.id);
      nameToId.set(f.path.replace(/\.md$/, "").toLowerCase(), f.id);
    }

    const links: GraphLink[] = [];
    const seen = new Set<string>();

    for (const file of files) {
      const wikiLinks = extractWikiLinks(file.content);
      for (const link of wikiLinks) {
        const targetId =
          nameToId.get(link.toLowerCase()) ??
          nameToId.get(link.replace(/\.md$/, "").toLowerCase());

        if (targetId && targetId !== file.id) {
          const key = [file.id, targetId].sort().join("-");
          if (!seen.has(key)) {
            seen.add(key);
            links.push({ source: file.id, target: targetId });
          }
        }
      }
    }

    return { nodes, links };
  },
}));

/** Opens Welcome.md on first load */
export function initializeVault() {
  const store = useVaultStore.getState();
  const welcome = store.getAllFiles().find((f) => f.path === "Welcome.md");
  if (welcome && store.tabs.length === 0) {
    store.openFile(welcome.id);
  }
}
