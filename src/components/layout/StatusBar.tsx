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
    <div className="flex h-[22px] shrink-0 items-center justify-between gap-2 border-t border-obs-border bg-obs-bg-secondary px-2 text-[11px] text-obs-text-faint sm:px-3">
      <div className="flex min-w-0 items-center gap-2 truncate">
        <span className="truncate">Demo Vault</span>
        <span className="hidden text-obs-border-light sm:inline">|</span>
        <span className="hidden shrink-0 sm:inline">{fileCount} notes</span>
        {viewMode === "graph" && (
          <>
            <span className="hidden text-obs-border-light md:inline">|</span>
            <span className="hidden shrink-0 md:inline">{graphStats.nodes} nodes</span>
            <span className="hidden text-obs-border-light lg:inline">|</span>
            <span className="hidden shrink-0 lg:inline">{graphStats.links} links</span>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {viewMode === "editor" && activeFile && (
          <>
            <span className="hidden md:inline">{words} words</span>
            <span className="hidden text-obs-border-light lg:inline">|</span>
            <span className="hidden lg:inline">{chars} characters</span>
            <span className="hidden text-obs-border-light xl:inline">|</span>
          </>
        )}
        <span className="hidden sm:inline">Obskinian v0.1</span>
      </div>
    </div>
  );
}
