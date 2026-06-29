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

  const words = activeFile ? countWords(activeFile.content) : 0;
  const chars = activeFile ? countCharacters(activeFile.content) : 0;

  return (
    <div className="flex h-[26px] shrink-0 items-center justify-between border-t border-obs-border bg-obs-bg-secondary px-3 text-[11px] text-obs-text-muted">
      <div className="flex items-center gap-3">
        <span>Demo Vault</span>
        <span className="text-obs-text-faint">|</span>
        <span>{allFiles.length} notes</span>
      </div>
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <span>{words} words</span>
            <span>{chars} characters</span>
          </>
        )}
        <span className="text-obs-text-faint">Obskinian v0.1</span>
      </div>
    </div>
  );
}
