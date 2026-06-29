/**
 * Graph filtering utilities for local, orphan, and search filters.
 */

import type { GraphLink, GraphNode } from "./types";

export type GraphDisplayFilter = "all" | "local" | "orphans";

/** Normalizes link endpoint to a string id */
function linkId(endpoint: string | GraphNode): string {
  return typeof endpoint === "string" ? endpoint : endpoint.id;
}

/** Filters graph data by display mode */
export function filterGraphByMode(
  nodes: GraphNode[],
  links: GraphLink[],
  mode: GraphDisplayFilter,
  activeFileId: string | null
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (mode === "all") return { nodes, links };

  if (mode === "orphans") {
    const connected = new Set<string>();
    for (const link of links) {
      connected.add(linkId(link.source));
      connected.add(linkId(link.target));
    }
    const orphanNodes = nodes.filter((n) => !connected.has(n.id));
    const orphanIds = new Set(orphanNodes.map((n) => n.id));
    return {
      nodes: orphanNodes,
      links: links.filter(
        (l) => orphanIds.has(linkId(l.source)) && orphanIds.has(linkId(l.target))
      ),
    };
  }

  if (mode === "local" && activeFileId) {
    const localIds = new Set<string>([activeFileId]);
    for (const link of links) {
      const source = linkId(link.source);
      const target = linkId(link.target);
      if (source === activeFileId) localIds.add(target);
      if (target === activeFileId) localIds.add(source);
    }
    return {
      nodes: nodes.filter((n) => localIds.has(n.id)),
      links: links.filter(
        (l) => localIds.has(linkId(l.source)) && localIds.has(linkId(l.target))
      ),
    };
  }

  return { nodes, links };
}

/** Filters graph by text search on node names */
export function filterGraphByText(
  nodes: GraphNode[],
  links: GraphLink[],
  query: string
): { nodes: GraphNode[]; links: GraphLink[] } {
  if (!query.trim()) return { nodes, links };

  const lower = query.toLowerCase();
  const matched = nodes.filter((n) => n.name.toLowerCase().includes(lower));
  const matchedIds = new Set(matched.map((n) => n.id));

  return {
    nodes: matched,
    links: links.filter(
      (l) => matchedIds.has(linkId(l.source)) || matchedIds.has(linkId(l.target))
    ),
  };
}
