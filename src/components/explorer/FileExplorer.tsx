/**
 * File explorer panel showing the vault folder tree.
 * Displays collapsible folders and clickable note files.
 */

"use client";

import { FolderPlus, FilePlus, ChevronsDownUp, LayoutTemplate } from "lucide-react";
import { iconBtnClass, panelHeaderClass, panelTitleClass } from "@/lib/ui-classes";
import { useVaultStore } from "@/lib/vault/vault-store";
import { FileTreeItem } from "./FileTreeItem";

/** Left sidebar file explorer panel */
export function FileExplorer() {
  const { vault, createNote, createFolder, collapseAllFolders, setTemplatePickerOpen } =
    useVaultStore();

  return (
    <div className="flex h-full flex-col">
      <div className={panelHeaderClass}>
        <span className={panelTitleClass}>File explorer</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="New note"
            aria-label="New note"
            onClick={() => createNote()}
            className={iconBtnClass}
          >
            <FilePlus size={14} />
          </button>
          <button
            type="button"
            title="Insert template"
            aria-label="Insert template"
            onClick={() => setTemplatePickerOpen(true)}
            className={iconBtnClass}
          >
            <LayoutTemplate size={14} />
          </button>
          <button
            type="button"
            title="New folder"
            aria-label="New folder"
            onClick={() => createFolder()}
            className={iconBtnClass}
          >
            <FolderPlus size={14} />
          </button>
          <button
            type="button"
            title="Collapse all"
            aria-label="Collapse all"
            onClick={() => collapseAllFolders()}
            className={iconBtnClass}
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
