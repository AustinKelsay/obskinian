/**
 * Context menu for file explorer actions.
 * Positioned at cursor with keyboard-dismiss support.
 */

"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  action: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  x: number;
  y: number;
  onClose: () => void;
}

/** Floating context menu overlay */
export function ContextMenu({ items, x, y, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 200);
  const adjustedY = Math.min(y, window.innerHeight - items.length * 36 - 16);

  return (
    <div
      ref={ref}
      className="fixed z-[100] min-w-[180px] overflow-hidden rounded-md border border-obs-border bg-obs-bg-secondary py-1 shadow-xl"
      style={{ left: adjustedX, top: adjustedY }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.disabled}
          onClick={() => {
            item.action();
            onClose();
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors",
            item.destructive
              ? "text-red-400 hover:bg-red-500/10"
              : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text",
            item.disabled && "pointer-events-none opacity-40"
          )}
        >
          {item.icon && <span className="shrink-0 opacity-70">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
