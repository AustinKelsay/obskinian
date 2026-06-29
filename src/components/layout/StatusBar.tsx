/**
 * Bottom status bar showing word count, character count, and vault info.
 * Mirrors Obsidian's status bar at the bottom of the window.
 */

"use client";

import { useMemo } from "react";
import { useVaultStore } from "@/lib/vault/vault-store";
import { computeGraphData, countVaultFiles, resolveActiveFile } from "@/lib/vault/compute-graph-data";
import { countCharacters, countWords } from "@/lib/utils";

/** Bottom status bar with document statistics */
export function StatusBar() {
  const vault = useVaultStore((s) => s.vault);
  const tabs = useVaultStore((s) => s.tabs);
  const activeTabId = useVaultStore((s) => s.activeTabId);
  const viewMode = useVaultStore((s) => s.viewMode);
  const graphFilter = useVaultStore((s) => s.graphFilter);
  const graphDisplayFilter = useVaultStore((s) => s.graphDisplayFilter);

  const activeFile = useMemo(
    () => resolveActiveFile(vault, tabs, activeTabId),
    [vault, tabs, activeTabId]
  );

  const fileCount = useMemo(() => countVaultFiles(vault), [vault]);

  const graphStats = useMemo(() => {
    const data = computeGraphData({
      vault,
      tabs,
      activeTabId,
      graphDisplayFilter,
      graphFilter,
    });
    return { nodes: data.nodes.length, links: data.links.length };
  }, [vault, tabs, activeTabId, graphDisplayFilter, graphFilter]);

  const words = activeFile ? countWords(activeFile.content) : 0;
  const chars = activeFile ? countCharacters(activeFile.content) : 0;

  return (
    <div className="flex h-[22px] shrink-0 items-center justify-between border-t border-obs-border bg-obs-bg-secondary px-3 text-[11px] text-obs-text-faint">
      <div className="flex items-center gap-2">
        <span>Demo Vault</span>
        <span className="text-obs-border-light">|</span>
        <span>{fileCount} notes</span>
        {viewMode === "graph" && (
          <>
            <span className="text-obs-border-light">|</span>
            <span>{graphStats.nodes} nodes</span>
            <span className="text-obs-border-light">|</span>
            <span>{graphStats.links} links</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {viewMode === "editor" && activeFile && (
          <>
            <span>{words} words</span>
            <span className="text-obs-border-light">|</span>
            <span>{chars} characters</span>
            <span className="text-obs-border-light">|</span>
          </>
        )}
        <span>Obskinian v0.1</span>
      </div>
    </div>
  );
}
