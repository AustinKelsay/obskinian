/**
 * Backlink row with hover preview tooltip.
 */

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface BacklinkItemProps {
  fileName: string;
  context: string;
  onClick: () => void;
}

/** Backlink entry with context preview on hover */
export function BacklinkItem({ fileName, context, onClick }: BacklinkItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-obs-interactive-hover"
        onClick={onClick}
      >
        <span className="text-[13px] font-medium text-obs-text">{fileName}</span>
        <span className="truncate text-[12px] text-obs-text-faint">{context}</span>
      </button>

      {hovered && context && (
        <div
          className={cn(
            "absolute right-full top-0 z-50 mr-2 w-[220px] rounded-md border border-obs-border",
            "bg-obs-bg-secondary p-3 shadow-xl"
          )}
        >
          <p className="mb-1 text-[11px] font-medium text-obs-accent">{fileName}</p>
          <p className="text-[12px] leading-relaxed text-obs-text-muted">{context}</p>
        </div>
      )}
    </div>
  );
}
