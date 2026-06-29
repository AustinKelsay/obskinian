/**
 * Bottom status bar showing word count, character count, and vault info.
 * Mirrors Obsidian's status bar at the bottom of the window.
 */

"use client";

import { useVaultStore } from "@/lib/vault/vault-store";
import { countCharacters, countWords } from "@/lib/utils";

/** Bottom status bar with document statistics */
export function StatusBar() {
  const activeFile = useVaultStore((s) => s.getActiveFile());
  const allFiles = useVaultStore((s) => s.getAllFiles());
  const viewMode = useVaultStore((s) => s.viewMode);
  const graphData = useVaultStore((s) => s.getGraphData());

  const words = activeFile ? countWords(activeFile.content) : 0;
  const chars = activeFile ? countCharacters(activeFile.content) : 0;

  return (
    <div className="flex h-[22px] shrink-0 items-center justify-between border-t border-obs-border bg-obs-bg-secondary px-3 text-[11px] text-obs-text-faint">
      <div className="flex items-center gap-2">
        <span>Demo Vault</span>
        <span className="text-obs-border-light">|</span>
        <span>{allFiles.length} notes</span>
        {viewMode === "graph" && (
          <>
            <span className="text-obs-border-light">|</span>
            <span>{graphData.nodes.length} nodes</span>
            <span className="text-obs-border-light">|</span>
            <span>{graphData.links.length} links</span>
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
