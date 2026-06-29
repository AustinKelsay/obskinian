/**
 * Backlink row with hover preview tooltip.
 */

"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BacklinkItemProps {
  fileName: string;
  context: string;
  onClick: () => void;
  onPromote?: () => void;
}

/** Backlink entry with context preview on hover */
export function BacklinkItem({ fileName, context, onClick, onPromote }: BacklinkItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          className="flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-obs-interactive-hover"
          onClick={onClick}
        >
          <span className="text-[13px] font-medium text-obs-text">{fileName}</span>
          <span className="truncate text-[12px] text-obs-text-faint">{context}</span>
        </button>
        {onPromote && (
          <button
            type="button"
            title="Convert to wiki-link"
            aria-label="Convert mention to wiki-link"
            onClick={(e) => {
              e.stopPropagation();
              onPromote();
            }}
            className="flex w-8 shrink-0 items-center justify-center text-obs-text-faint hover:bg-obs-interactive-hover hover:text-obs-accent"
          >
            <Link2 size={13} />
          </button>
        )}
      </div>

      {hovered && context && (
        <div
          className={cn(
            "pointer-events-none absolute left-3 right-3 top-full z-50 mt-1 rounded-sm border border-obs-border",
            "max-h-[140px] overflow-y-auto bg-obs-bg-secondary p-2.5 shadow-lg"
          )}
        >
          <p className="mb-1 text-[11px] font-medium text-obs-accent">{fileName}</p>
          <p className="text-[12px] leading-relaxed text-obs-text-muted">{context}</p>
        </div>
      )}
    </div>
  );
}
