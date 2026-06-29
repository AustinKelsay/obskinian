/**
 * Zustand store for global Obsidian clone application state.
 * Manages vault tree, tabs, panes, panels, and filesystem sync.
 */

import { create } from "zustand";
import type {
  EditorMode,
  EditorPane,
  EditorTab,
  GraphLink,
  GraphNode,
  LeftPanel,
  RightPanel,
  SearchResult,
  SplitDirection,
  VaultFile,
  VaultFolder,
  ViewMode,
} from "./types";
import {
  addFileToTree,
  addFolderToTree,
  buildVaultTree,
  collapseAllFolders,
  findFileById,
  findFileByLink,
  flattenVaultFiles,
  generateUntitledFolderPath,
  generateUntitledPath,
  removeNodeFromTree,
  toggleFolderExpanded,
  updateFileContent,
} from "./vault-data";
import { extractWikiLinks } from "./link-parser";
import { getFileDisplayName, pathToId } from "../utils";
import { pluginRegistry } from "../plugins/registry";
const RECENT_KEY = "obskinian-recent-files";
const MAX_RECENT = 10;

/** Loads recent file ids from localStorage */
function loadRecentFiles(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Persists a file id to the recent files list */
function pushRecentFile(fileId: string): string[] {
  const recent = loadRecentFiles().filter((id) => id !== fileId);
  recent.unshift(fileId);
  const trimmed = recent.slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
  return trimmed;
}

interface VaultStore {
  vault: VaultFolder;
  isVaultLoaded: boolean;
  tabs: EditorTab[];
  activeTabId: string | null;
  panes: EditorPane[];
  activePaneId: string;
  splitDirection: SplitDirection;
  leftPanel: LeftPanel;
  rightPanel: RightPanel;
  isLeftSidebarOpen: boolean;
  isRightSidebarOpen: boolean;
  viewMode: ViewMode;
  searchQuery: string;
  searchResults: SearchResult[];
  graphFilter: string;
  isCommandPaletteOpen: boolean;
  recentFileIds: string[];
  scrollToHeadingId: string | null;
  dragItemId: string | null;

  loadVault: () => Promise<void>;
  openFile: (fileId: string, paneId?: string) => void;
  openFileByLink: (link: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  pinTab: (tabId: string) => void;
  updateContent: (fileId: string, content: string) => void;
  createNote: (folderPath?: string) => Promise<void>;
  createFolder: (parentPath?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  renameNode: (nodeId: string, newName: string) => Promise<void>;
  moveFile: (fileId: string, targetFolderPath: string) => Promise<void>;
  collapseAllFolders: () => void;
  toggleFolder: (folderId: string) => void;
  setLeftPanel: (panel: LeftPanel) => void;
  setRightPanel: (panel: RightPanel) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;
  setGraphFilter: (filter: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  scrollToHeading: (headingId: string) => void;
  clearScrollToHeading: () => void;
  setDragItemId: (id: string | null) => void;
  setPaneEditorMode: (paneId: string, mode: EditorMode) => void;
  setActivePane: (paneId: string) => void;
  splitPane: (direction: "vertical" | "horizontal") => void;
  closeSplit: () => void;
  getActiveFile: () => VaultFile | null;
  getPaneFile: (paneId: string) => VaultFile | null;
  getAllFiles: () => VaultFile[];
  getGraphData: () => { nodes: GraphNode[]; links: GraphLink[] };
}

let tabCounter = 0;
let paneCounter = 1;

/** Persists file content to the vault API */
async function persistFile(path: string, content: string): Promise<void> {
  await fetch("/api/vault", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, content }),
  });
}

/** Creates the Zustand vault store */
export const useVaultStore = create<VaultStore>((set, get) => ({
  vault: buildVaultTree(),
  isVaultLoaded: false,
  tabs: [],
  activeTabId: null,
  panes: [{ id: "pane-1", fileId: null, editorMode: "live" }],
  activePaneId: "pane-1",
  splitDirection: "none",
  leftPanel: "explorer",
  rightPanel: "outline",
  isLeftSidebarOpen: true,
  isRightSidebarOpen: true,
  viewMode: "editor",
  searchQuery: "",
  searchResults: [],
  graphFilter: "",
  isCommandPaletteOpen: false,
  recentFileIds: [],
  scrollToHeadingId: null,
  dragItemId: null,

  loadVault: async () => {
    try {
      const res = await fetch("/api/vault");
      const data = await res.json();
      if (data.vault) {
        set({ vault: data.vault, isVaultLoaded: true });
        pluginRegistry.fireHook("onVaultLoad");
      }
    } catch {
      set({ isVaultLoaded: true });
    }
  },

  openFile: (fileId: string, paneId?: string) => {
    const { vault, tabs, panes, activePaneId } = get();
    const file = findFileById(vault, fileId);
    if (!file) return;

    const targetPane = paneId ?? activePaneId;
    const updatedPanes = panes.map((p) =>
      p.id === targetPane ? { ...p, fileId } : p
    );

    const existing = tabs.find((t) => t.fileId === fileId);
    if (existing) {
      set({
        activeTabId: existing.id,
        viewMode: "editor",
        panes: updatedPanes,
        activePaneId: targetPane,
        recentFileIds: pushRecentFile(file.id),
      });
      pluginRegistry.fireHook("onFileOpen", file.path);
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
      panes: updatedPanes,
      activePaneId: targetPane,
      recentFileIds: pushRecentFile(file.id),
    });
    pluginRegistry.fireHook("onFileOpen", file.path);
  },

  openFileByLink: (link: string) => {
    const file = findFileByLink(get().vault, link);
    if (file) get().openFile(file.id);
  },

  closeTab: (tabId: string) => {
    const { tabs, activeTabId, panes } = get();
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    const idx = tabs.findIndex((t) => t.id === tabId);
    const newTabs = tabs.filter((t) => t.id !== tabId);
    let newActiveId = activeTabId;

    if (activeTabId === tabId) {
      newActiveId = newTabs.length === 0 ? null : newTabs[Math.min(idx, newTabs.length - 1)].id;
    }

    const updatedPanes = panes.map((p) =>
      p.fileId === tab.fileId ? { ...p, fileId: null } : p
    );

    set({ tabs: newTabs, activeTabId: newActiveId, panes: updatedPanes });
  },

  setActiveTab: (tabId: string) => {
    const tab = get().tabs.find((t) => t.id === tabId);
    if (!tab) return;
    set({ activeTabId: tabId, viewMode: "editor" });
    get().openFile(tab.fileId);
  },

  pinTab: (tabId: string) => {
    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === tabId ? { ...t, isPinned: !t.isPinned } : t
      ),
    }));
  },

  updateContent: (fileId: string, content: string) => {
    const file = findFileById(get().vault, fileId);
    set((state) => ({
      vault: updateFileContent(state.vault, fileId, content) as VaultFolder,
    }));
    if (file) {
      persistFile(file.path, content);
      pluginRegistry.fireHook("onFileSave", file.path, content);
    }
  },

  createNote: async (folderPath?: string) => {
    const files = get().getAllFiles();
    const name = generateUntitledPath(files);
    const filePath = folderPath ? `${folderPath}/${name}` : name;
    const content = `# ${name.replace(".md", "")}\n\n`;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", path: filePath, content, type: "file" }),
      });
      const data = await res.json();
      if (data.file) {
        set((state) => ({
          vault: addFileToTree(state.vault, data.file),
        }));
        get().openFile(data.file.id);
        pluginRegistry.fireHook("onFileCreate", filePath);
      }
    } catch {
      /* client-only fallback */
      const file: VaultFile = {
        id: pathToId(filePath),
        name,
        type: "file",
        path: filePath,
        content,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
      };
      set((state) => ({ vault: addFileToTree(state.vault, file) }));
      get().openFile(file.id);
    }
  },

  createFolder: async (parentPath?: string) => {
    const folderName = generateUntitledFolderPath(get().vault);
    const folderPath = parentPath ? `${parentPath}/${folderName}` : folderName;

    try {
      await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", path: folderPath, type: "folder" }),
      });
    } catch {
      /* continue with local update */
    }

    set((state) => ({
      vault: addFolderToTree(state.vault, folderPath),
    }));
  },

  deleteFile: async (fileId: string) => {
    const file = findFileById(get().vault, fileId);
    if (!file) return;

    try {
      await fetch(`/api/vault?path=${encodeURIComponent(file.path)}`, { method: "DELETE" });
    } catch {
      /* continue with local delete */
    }

    const { tabs, panes } = get();
    const tab = tabs.find((t) => t.fileId === fileId);
    if (tab) get().closeTab(tab.id);

    set((state) => ({
      vault: removeNodeFromTree(state.vault, fileId) as VaultFolder,
      panes: panes.map((p) => (p.fileId === fileId ? { ...p, fileId: null } : p)),
    }));
    pluginRegistry.fireHook("onFileDelete", file.path);
  },

  renameNode: async (nodeId: string, newName: string) => {
    const { vault } = get();
    const node = findNodeById(vault, nodeId);
    if (!node || !newName.trim()) return;

    const trimmed = newName.trim();
    const parentPath = node.path.includes("/")
      ? node.path.split("/").slice(0, -1).join("/")
      : "";

    const isFile = node.type === "file";
    const finalName = isFile
      ? trimmed.endsWith(".md")
        ? trimmed
        : `${trimmed}.md`
      : trimmed;
    const newPath = parentPath ? `${parentPath}/${finalName}` : finalName;

    if (newPath === node.path) return;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", path: node.path, newPath }),
      });
      const data = await res.json();
      if (data.vault) {
        const newId = pathToId(newPath);
        remapFileReferences(nodeId, newId, node.path, newPath);
        set({ vault: data.vault });
      }
    } catch {
      /* ignore */
    }
  },

  moveFile: async (fileId: string, targetFolderPath: string) => {
    const file = findFileById(get().vault, fileId);
    if (!file) return;

    const currentFolder = file.path.includes("/")
      ? file.path.split("/").slice(0, -1).join("/")
      : "";
    if (currentFolder === targetFolderPath) return;

    try {
      const res = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "move", path: file.path, targetFolder: targetFolderPath }),
      });
      const data = await res.json();
      if (data.vault) {
        const segments = file.path.split("/");
        const fileName = segments[segments.length - 1];
        const newPath = targetFolderPath ? `${targetFolderPath}/${fileName}` : fileName;
        const newId = pathToId(newPath);
        remapFileReferences(fileId, newId, file.path, newPath);
        set({ vault: data.vault });
      }
    } catch {
      /* ignore */
    }
  },

  toggleFolder: (folderId: string) => {
    set((state) => ({
      vault: toggleFolderExpanded(state.vault, folderId) as VaultFolder,
    }));
  },

  collapseAllFolders: () => {
    set((state) => ({
      vault: collapseAllFolders(state.vault) as VaultFolder,
    }));
  },

  setLeftPanel: (panel: LeftPanel) => {
    set((state) => {
      const isClosing = state.leftPanel === panel && panel !== "none";
      return {
        leftPanel: isClosing ? "none" : panel,
        isLeftSidebarOpen: !isClosing,
        viewMode:
          panel === "graph" && !isClosing
            ? "graph"
            : isClosing
              ? state.viewMode
              : panel === "graph"
                ? "graph"
                : "editor",
      };
    });
  },

  setRightPanel: (panel: RightPanel) => {
    set((state) => ({
      rightPanel: state.rightPanel === panel ? "none" : panel,
      isRightSidebarOpen: state.rightPanel !== panel,
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

  setViewMode: (mode: ViewMode) => set({ viewMode: mode }),

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
          results.push({
            fileId: file.id,
            filePath: file.path,
            fileName: getFileDisplayName(file.path),
            snippet:
              (start > 0 ? "..." : "") +
              file.content.slice(start, end) +
              (end < file.content.length ? "..." : ""),
            matchIndex: idx,
          });
        }
      }
    }

    set({ searchQuery: query, searchResults: results });
  },

  setGraphFilter: (filter: string) => set({ graphFilter: filter }),
  setCommandPaletteOpen: (open: boolean) => set({ isCommandPaletteOpen: open }),
  scrollToHeading: (headingId: string) => set({ scrollToHeadingId: headingId }),
  clearScrollToHeading: () => set({ scrollToHeadingId: null }),
  setDragItemId: (id: string | null) => set({ dragItemId: id }),

  setPaneEditorMode: (paneId: string, mode: EditorMode) => {
    set((state) => ({
      panes: state.panes.map((p) => (p.id === paneId ? { ...p, editorMode: mode } : p)),
    }));
  },

  setActivePane: (paneId: string) => set({ activePaneId: paneId }),

  splitPane: (direction: "vertical" | "horizontal") => {
    const { panes, splitDirection } = get();
    if (splitDirection !== "none") return;

    paneCounter += 1;
    const newPane: EditorPane = {
      id: `pane-${paneCounter}`,
      fileId: null,
      editorMode: "live",
    };

    set({
      panes: [...panes, newPane],
      splitDirection: direction,
      activePaneId: newPane.id,
    });
  },

  closeSplit: () => {
    const { panes } = get();
    set({
      panes: [panes[0]],
      splitDirection: "none",
      activePaneId: panes[0].id,
    });
  },

  getActiveFile: () => {
    const { vault, tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return null;
    return findFileById(vault, tab.fileId);
  },

  getPaneFile: (paneId: string) => {
    const pane = get().panes.find((p) => p.id === paneId);
    if (!pane?.fileId) return null;
    return findFileById(get().vault, pane.fileId);
  },

  getAllFiles: () => flattenVaultFiles(get().vault),

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
      for (const link of extractWikiLinks(file.content)) {
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

/** Loads vault from disk and opens Welcome.md */
export async function initializeVault() {
  useVaultStore.setState({ recentFileIds: loadRecentFiles() });

  const store = useVaultStore.getState();
  await store.loadVault();

  const { maybeOpenDailyNoteOnStartup } = await import("@/lib/plugins/daily-notes");
  await maybeOpenDailyNoteOnStartup();

  const state = useVaultStore.getState();
  if (state.tabs.length > 0) return;

  const welcome = state.getAllFiles().find((f) => f.path === "Welcome.md");
  if (welcome) state.openFile(welcome.id);
}

/** Finds any vault node by id */
function findNodeById(node: import("./types").VaultNode, id: string): import("./types").VaultNode | null {
  if (node.id === id) return node;
  if (node.type === "folder") {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/** Remaps tab, pane, and recent references after rename/move */
function remapFileReferences(oldId: string, newId: string, oldPath: string, newPath: string): void {
  useVaultStore.setState((state) => ({
    tabs: state.tabs.map((t) =>
      t.fileId === oldId
        ? { ...t, fileId: newId, filePath: newPath, fileName: getFileDisplayName(newPath) }
        : t
    ),
    panes: state.panes.map((p) => (p.fileId === oldId ? { ...p, fileId: newId } : p)),
    recentFileIds: state.recentFileIds.map((id) => (id === oldId ? newId : id)),
  }));
}
