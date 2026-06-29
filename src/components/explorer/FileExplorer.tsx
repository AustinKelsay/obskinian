/**
 * File explorer panel showing the vault folder tree.
 * Displays collapsible folders and clickable note files.
 */

"use client";

import { FolderPlus, FilePlus, ChevronsDownUp } from "lucide-react";
import { useVaultStore } from "@/lib/vault/vault-store";
import { FileTreeItem } from "./FileTreeItem";

/** Left sidebar file explorer panel */
export function FileExplorer() {
  const { vault, createNote } = useVaultStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-obs-border px-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-obs-text-muted">
          Files
        </span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="New note"
            aria-label="New note"
            onClick={() => createNote()}
            className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
          >
            <FilePlus size={14} />
          </button>
          <button
            type="button"
            title="New folder"
            aria-label="New folder"
            className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
          >
            <FolderPlus size={14} />
          </button>
          <button
            type="button"
            title="Collapse all"
            aria-label="Collapse all"
            className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
          >
            <ChevronsDownUp size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-1 py-1">
        {vault.children.map((child) => (
          <FileTreeItem key={child.id} node={child} />
        ))}
      </div>
    </div>
  );
}
