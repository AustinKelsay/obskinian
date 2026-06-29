/**
 * Tab bar for open note tabs with drag-and-drop reordering.
 */

"use client";

import { useState } from "react";
import { X, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault/vault-store";

/** Horizontal tab bar showing all open notes */
export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, pinTab, reorderTabs } = useVaultStore();
  const [dragTabId, setDragTabId] = useState<string | null>(null);
  const [dropTabId, setDropTabId] = useState<string | null>(null);

  if (tabs.length === 0) return null;

  return (
    <div className="flex h-[36px] shrink-0 flex-1 items-end overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const isDropTarget = dropTabId === tab.id && dragTabId !== tab.id;

        return (
          <div
            key={tab.id}
            draggable
            className={cn(
              "group relative flex h-[34px] max-w-[200px] shrink-0 cursor-pointer items-center gap-1.5 border-r border-obs-border px-3 text-[13px] transition-colors",
              isActive
                ? "bg-obs-bg text-obs-text"
                : "bg-obs-bg-secondary text-obs-text-muted hover:bg-obs-interactive hover:text-obs-text",
              tab.isPinned && "border-l-2 border-l-obs-accent/50",
              isDropTarget && "bg-obs-accent/10 ring-1 ring-inset ring-obs-accent/40"
            )}
            onClick={() => setActiveTab(tab.id)}
            onDragStart={() => setDragTabId(tab.id)}
            onDragEnd={() => {
              setDragTabId(null);
              setDropTabId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDropTabId(tab.id);
            }}
            onDragLeave={() => setDropTabId(null)}
            onDrop={(e) => {
              e.preventDefault();
              if (dragTabId) reorderTabs(dragTabId, tab.id);
              setDragTabId(null);
              setDropTabId(null);
            }}
            role="tab"
            aria-selected={isActive}
          >
            {isActive && (
              <div className="absolute inset-x-0 top-0 h-[2px] bg-obs-accent" />
            )}
            {tab.isPinned && <Pin size={10} className="shrink-0 text-obs-accent" />}
            <span className="truncate">{tab.fileName}</span>
            <button
              type="button"
              aria-label={`Pin ${tab.fileName}`}
              title="Pin tab"
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100",
                tab.isPinned && "opacity-60 text-obs-accent"
              )}
              onClick={(e) => {
                e.stopPropagation();
                pinTab(tab.id);
              }}
            >
              <Pin size={10} />
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.fileName}`}
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100",
                isActive && "opacity-60",
                "hover:bg-obs-interactive-hover hover:opacity-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
