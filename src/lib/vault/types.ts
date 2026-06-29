/**
 * Vault type definitions for the Obsidian clone file system.
 * Models folders, markdown notes, and graph link relationships.
 */

/** Supported node types in the vault tree */
export type VaultNodeType = "folder" | "file";

/** A folder node containing child nodes */
export interface VaultFolder {
  id: string;
  name: string;
  type: "folder";
  path: string;
  children: VaultNode[];
  isExpanded?: boolean;
}

/** A markdown note file */
export interface VaultFile {
  id: string;
  name: string;
  type: "file";
  path: string;
  content: string;
  createdAt: string;
  modifiedAt: string;
}

export type VaultNode = VaultFolder | VaultFile;

/** An open editor tab */
export interface EditorTab {
  id: string;
  fileId: string;
  filePath: string;
  fileName: string;
  isPinned?: boolean;
}

/** Sidebar panel identifiers matching Obsidian's left ribbon */
export type LeftPanel = "explorer" | "search" | "graph" | "settings" | "none";

/** Right sidebar panel identifiers */
export type RightPanel = "outline" | "backlinks" | "tags" | "none";

/** Graph node for force-directed visualization */
export interface GraphNode {
  id: string;
  name: string;
  path: string;
  val: number;
  color?: string;
}

/** Graph edge representing wiki-link connections */
export interface GraphLink {
  source: string;
  target: string;
}

/** Parsed heading for outline panel */
export interface OutlineHeading {
  level: number;
  text: string;
  id: string;
}

/** Search result entry */
export interface SearchResult {
  fileId: string;
  filePath: string;
  fileName: string;
  snippet: string;
  matchIndex: number;
}

/** Application view mode */
export type ViewMode = "editor" | "graph";

/** Editor display mode — WYSIWYG or raw markdown source */
export type EditorMode = "live" | "source";

/** Split pane layout direction */
export type SplitDirection = "none" | "vertical" | "horizontal";

/** A single editor pane in a split layout */
export interface EditorPane {
  id: string;
  fileId: string | null;
  editorMode: EditorMode;
}

/** Command palette item */
export interface CommandItem {
  id: string;
  label: string;
  group: string;
  shortcut?: string;
  action: () => void;
}
