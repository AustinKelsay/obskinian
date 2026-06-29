/**
 * Tab bar for open note tabs, matching Obsidian's tabbed interface.
 * Supports tab switching, closing, and active state styling.
 */

"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault/vault-store";

/** Horizontal tab bar showing all open notes */
export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useVaultStore();

  if (tabs.length === 0) return null;

  return (
    <div className="flex h-[36px] shrink-0 items-end overflow-x-auto border-b border-obs-border bg-obs-bg-secondary">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={cn(
              "group relative flex h-[34px] max-w-[200px] shrink-0 cursor-pointer items-center gap-1.5 border-r border-obs-border px-3 text-[13px] transition-colors",
              isActive
                ? "bg-obs-bg text-obs-text"
                : "bg-obs-bg-secondary text-obs-text-muted hover:bg-obs-interactive hover:text-obs-text"
            )}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={isActive}
          >
            {isActive && (
              <div className="absolute inset-x-0 top-0 h-[2px] bg-obs-accent" />
            )}
            <span className="truncate">{tab.fileName}</span>
            <button
              type="button"
              aria-label={`Close ${tab.fileName}`}
              className={cn(
                "ml-auto flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100",
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
