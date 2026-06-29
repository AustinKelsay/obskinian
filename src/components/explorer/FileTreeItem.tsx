/**
 * Recursive file tree item for the vault explorer sidebar.
 * Supports rename, delete, and drag-and-drop file moves.
 */

"use client";

import { useRef, useState } from "react";
import { ChevronRight, FileText, Folder, FolderOpen, Pencil, Trash2 } from "lucide-react";
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
  const {
    openFile,
    toggleFolder,
    activeTabId,
    tabs,
    deleteFile,
    renameNode,
    moveFile,
    setDragItemId,
    dragItemId,
  } = useVaultStore();

  const [hovered, setHovered] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [dropTarget, setDropTarget] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const isActive = node.type === "file" && activeTab?.fileId === node.id;
  const displayName = node.type === "file" ? getFileDisplayName(node.path) : node.name;

  function startRename() {
    setRenameValue(displayName);
    setRenaming(true);
    setTimeout(() => inputRef.current?.select(), 50);
  }

  async function commitRename() {
    setRenaming(false);
    if (renameValue.trim() && renameValue.trim() !== displayName) {
      await renameNode(node.id, renameValue.trim());
    }
  }

  if (node.type === "folder") {
    return (
      <div>
        <div
          className={cn(
            "flex items-center",
            dropTarget && "rounded-sm bg-obs-accent/15 ring-1 ring-obs-accent/40"
          )}
          onDragOver={(e) => {
            if (!dragItemId) return;
            e.preventDefault();
            setDropTarget(true);
          }}
          onDragLeave={() => setDropTarget(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDropTarget(false);
            if (dragItemId) moveFile(dragItemId, node.path);
            setDragItemId(null);
          }}
        >
          {renaming ? (
            <input
              ref={inputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="mx-1 flex-1 rounded border border-obs-accent bg-obs-interactive px-1 py-[2px] text-[13px] text-obs-text outline-none"
              style={{ marginLeft: `${depth * 16 + 4}px` }}
            />
          ) : (
            <button
              type="button"
              className="flex w-full items-center gap-1 rounded-sm px-1 py-[3px] text-[13px] text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text"
              style={{ paddingLeft: `${depth * 16 + 4}px` }}
              onClick={() => toggleFolder(node.id)}
              onDoubleClick={(e) => {
                e.preventDefault();
                startRename();
              }}
            >
              <ChevronRight
                size={14}
                className={cn("shrink-0 transition-transform", node.isExpanded && "rotate-90")}
              />
              {node.isExpanded ? (
                <FolderOpen size={14} className="shrink-0 text-obs-accent" />
              ) : (
                <Folder size={14} className="shrink-0 text-obs-text-faint" />
              )}
              <span className="truncate">{node.name}</span>
            </button>
          )}
        </div>
        {node.isExpanded &&
          node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
      </div>
    );
  }

  return (
    <div
      className="group relative flex items-center"
      draggable={!renaming}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragStart={() => setDragItemId(node.id)}
      onDragEnd={() => setDragItemId(null)}
    >
      {renaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") setRenaming(false);
          }}
          className="mx-1 flex-1 rounded border border-obs-accent bg-obs-interactive px-1 py-[2px] text-[13px] text-obs-text outline-none"
          style={{ marginLeft: `${depth * 16 + 22}px` }}
        />
      ) : (
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
          onDoubleClick={(e) => {
            e.preventDefault();
            startRename();
          }}
        >
          <FileText size={14} className="shrink-0 text-obs-text-faint" />
          <span className="truncate">{displayName}</span>
        </button>
      )}
      {hovered && !renaming && (
        <div className="absolute right-1 flex items-center gap-0.5">
          <button
            type="button"
            title="Rename"
            aria-label="Rename"
            className="flex h-5 w-5 items-center justify-center rounded text-obs-text-faint opacity-0 hover:bg-obs-interactive-hover hover:text-obs-text group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              startRename();
            }}
          >
            <Pencil size={11} />
          </button>
          <button
            type="button"
            title="Delete note"
            aria-label="Delete note"
            className="flex h-5 w-5 items-center justify-center rounded text-obs-text-faint opacity-0 hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete "${displayName}"?`)) deleteFile(node.id);
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
