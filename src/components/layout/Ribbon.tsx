/**
 * Left vertical ribbon matching Obsidian's icon navigation bar.
 * Switches between explorer, search, graph, and settings panels.
 */

"use client";

import { Files, Search, Waypoints, Settings, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ribbonBtnClass } from "@/lib/ui-classes";
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
      icon: <Waypoints size={18} strokeWidth={1.5} />,
      label: "Graph view",
      action: () => {
        setLeftPanel("graph");
        setViewMode("graph");
      },
    },
  ];

  function ribbonItemClass(isActive: boolean) {
    return cn(
      ribbonBtnClass,
      isActive
        ? "bg-obs-interactive-hover text-obs-text before:absolute before:inset-y-1 before:left-0 before:w-[2px] before:rounded-r before:bg-obs-accent"
        : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
    );
  }

  return (
    <div className="flex h-full w-[44px] shrink-0 flex-col items-center border-r border-obs-border bg-obs-ribbon py-1.5">
      <div className="flex flex-1 flex-col items-center gap-0.5">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            title={item.label}
            aria-label={item.label}
            aria-current={leftPanel === item.id ? "page" : undefined}
            onClick={item.action}
            className={ribbonItemClass(leftPanel === item.id)}
          >
            {item.icon}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={() => {
            setLeftPanel("settings");
            setViewMode("editor");
          }}
          className={ribbonItemClass(leftPanel === "settings")}
        >
          <Settings size={18} strokeWidth={1.5} />
        </button>
        <button
          type="button"
          title="Help (coming soon)"
          aria-label="Help"
          disabled
          className={cn(ribbonBtnClass, "cursor-default text-obs-text-faint opacity-40")}
        >
          <HelpCircle size={18} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
