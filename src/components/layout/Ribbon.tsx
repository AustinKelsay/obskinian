/**
 * Left vertical ribbon matching Obsidian's icon navigation bar.
 * Switches between explorer, search, graph, and settings panels.
 */

"use client";

import { Files, Search, Share2, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeftPanel } from "@/lib/vault/types";
import { useVaultStore } from "@/lib/vault/vault-store";

interface RibbonItem {
  id: LeftPanel;
  icon: React.ReactNode;
  label: string;
  action?: () => void;
}

/** Vertical icon ribbon on the far left of the app shell */
export function Ribbon() {
  const { leftPanel, setLeftPanel, setViewMode } = useVaultStore();

  const items: RibbonItem[] = [
    {
      id: "explorer",
      icon: <Files size={18} strokeWidth={1.5} />,
      label: "File explorer",
      action: () => {
        setLeftPanel("explorer");
        setViewMode("editor");
      },
    },
    {
      id: "search",
      icon: <Search size={18} strokeWidth={1.5} />,
      label: "Search",
      action: () => {
        setLeftPanel("search");
        setViewMode("editor");
      },
    },
    {
      id: "graph",
      icon: <Share2 size={18} strokeWidth={1.5} />,
      label: "Graph view",
      action: () => {
        setLeftPanel("graph");
        setViewMode("graph");
      },
    },
  ];

  return (
    <div className="flex h-full w-[44px] shrink-0 flex-col items-center border-r border-obs-border bg-obs-ribbon py-2">
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            onClick={item.action}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
              leftPanel === item.id
                ? "bg-obs-accent/20 text-obs-accent"
                : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
            )}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={() => {
            setLeftPanel("settings");
            setViewMode("editor");
          }}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
            leftPanel === "settings"
              ? "bg-obs-accent/20 text-obs-accent"
              : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
          )}
        >
          <Settings size={18} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          title="Help"
          aria-label="Help"
          className="flex h-9 w-9 items-center justify-center rounded-md text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text"
        >
          <HelpCircle size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
