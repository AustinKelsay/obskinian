/**
 * Floating slash command menu for editor insertion.
 */

"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { SlashCommand } from "@/lib/editor/slash-commands";

interface SlashCommandMenuProps {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: SlashCommand) => void;
  onHover: (index: number) => void;
  position?: { top: number; left: number };
}

/** Dropdown menu for slash commands */
export function SlashCommandMenu({
  commands,
  selectedIndex,
  onSelect,
  onHover,
  position,
}: SlashCommandMenuProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (commands.length === 0) return null;

  return (
    <div
      className="absolute z-50 w-[260px] overflow-hidden rounded-lg border border-obs-border bg-obs-bg-secondary shadow-xl"
      style={position ? { top: position.top, left: position.left } : { top: 8, left: 48 }}
    >
      <div ref={listRef} className="max-h-[240px] overflow-y-auto py-1">
        {commands.map((cmd, index) => (
          <button
            key={cmd.id}
            type="button"
            className={cn(
              "flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors",
              index === selectedIndex
                ? "bg-obs-accent/20 text-obs-text"
                : "text-obs-text-muted hover:bg-obs-interactive-hover"
            )}
            onClick={() => onSelect(cmd)}
            onMouseEnter={() => onHover(index)}
          >
            <span className="text-[13px] font-medium">/{cmd.id}</span>
            <span className="text-[11px] text-obs-text-faint">{cmd.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
