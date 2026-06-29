/**
 * Pure graph data computation from vault state.
 * Kept separate from the Zustand store so selectors can use stable primitives + useMemo.
 */

import type { GraphDisplayFilter } from "./graph-utils";
import { filterGraphByMode, filterGraphByText } from "./graph-utils";
import type { GraphLink, GraphNode, VaultFile, VaultFolder } from "./types";
import { flattenVaultFiles, findFileById } from "./vault-data";
import {
  extractWikiEmbeds,
  extractWikiLinks,
  resolveNoteId,
} from "./link-parser";
import { getFileDisplayName } from "../utils";

interface ComputeGraphInput {
  vault: VaultFolder;
  activeTabId: string | null;
  tabs: { id: string; fileId: string }[];
  graphDisplayFilter: GraphDisplayFilter;
  graphFilter: string;
}

/** Resolves the currently active note from tab state */
export function resolveActiveFile(
  vault: VaultFolder,
  tabs: { id: string; fileId: string }[],
  activeTabId: string | null
): VaultFile | null {
  const tab = tabs.find((t) => t.id === activeTabId);
  if (!tab) return null;
  return findFileById(vault, tab.fileId);
}

/** Builds filtered graph nodes and links for the graph view */
export function computeGraphData(input: ComputeGraphInput): {
  nodes: GraphNode[];
  links: GraphLink[];
} {
  const files = flattenVaultFiles(input.vault);
  const nodes: GraphNode[] = files.map((f) => ({
    id: f.id,
    name: getFileDisplayName(f.path),
    path: f.path,
    val: 1 + extractWikiLinks(f.content).length * 0.5 + extractWikiEmbeds(f.content).length * 0.4,
  }));

  const nameToId = new Map<string, string>();
  for (const f of files) {
    nameToId.set(getFileDisplayName(f.path).toLowerCase(), f.id);
    nameToId.set(f.path.replace(/\.md$/, "").toLowerCase(), f.id);
  }

  const links: GraphLink[] = [];
  const seen = new Set<string>();

  function addEdge(sourceId: string, targetName: string, kind: "link" | "embed") {
    const targetId = resolveNoteId(targetName, nameToId);
    if (!targetId || targetId === sourceId) return;
    const key = `${kind}:${[sourceId, targetId].sort().join("-")}`;
    if (seen.has(key)) return;
    seen.add(key);
    links.push({ source: sourceId, target: targetId, kind });
  }

  for (const file of files) {
    for (const link of extractWikiLinks(file.content)) {
      addEdge(file.id, link, "link");
    }
    for (const embed of extractWikiEmbeds(file.content)) {
      addEdge(file.id, embed, "embed");
    }
  }

  const activeFile = resolveActiveFile(input.vault, input.tabs, input.activeTabId);
  let filtered = filterGraphByMode(
    nodes,
    links,
    input.graphDisplayFilter,
    activeFile?.id ?? null
  );
  filtered = filterGraphByText(filtered.nodes, filtered.links, input.graphFilter);
  return filtered;
}

/** Counts markdown files in the vault tree */
export function countVaultFiles(vault: VaultFolder): number {
  return flattenVaultFiles(vault).length;
}
