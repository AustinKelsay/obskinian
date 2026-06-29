/**
 * Recursive file tree item for the vault explorer sidebar.
 * Renders folders (collapsible) and files (clickable) with Obsidian styling.
 */

"use client";

import { ChevronRight, FileText, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VaultNode } from "@/lib/vault/types";
import { useVaultStore } from "@/lib/vault/vault-store";
import { getFileDisplayName } from "@/lib/utils";

interface FileTreeItemProps {
  node: VaultNode;
  depth?: number;
}

/** Single row in the file explorer tree */
export function FileTreeItem({ node, depth = 0 }: FileTreeItemProps) {
  const { openFile, toggleFolder, activeTabId, tabs } = useVaultStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isActive = node.type === "file" && activeTab?.fileId === node.id;

  if (node.type === "folder") {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center gap-1 rounded-sm px-1 py-[3px] text-[13px] text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text"
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
          onClick={() => toggleFolder(node.id)}
        >
          <ChevronRight
            size={14}
            className={cn(
              "shrink-0 transition-transform",
              node.isExpanded && "rotate-90"
            )}
          />
          {node.isExpanded ? (
            <FolderOpen size={14} className="shrink-0 text-obs-accent" />
          ) : (
            <Folder size={14} className="shrink-0 text-obs-text-faint" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {node.isExpanded &&
          node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-1.5 rounded-sm px-1 py-[3px] text-[13px] transition-colors",
        isActive
          ? "bg-obs-accent/15 text-obs-text"
          : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
      )}
      style={{ paddingLeft: `${depth * 16 + 22}px` }}
      onClick={() => openFile(node.id)}
    >
      <FileText size={14} className="shrink-0 text-obs-text-faint" />
      <span className="truncate">{getFileDisplayName(node.path)}</span>
    </button>
  );
}
