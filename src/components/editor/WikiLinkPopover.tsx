/**
 * Floating hover preview for wiki-links in the editor.
 */

"use client";

import { cn } from "@/lib/utils";

interface WikiLinkPopoverProps {
  title: string;
  preview: string;
  position: { top: number; left: number };
  visible: boolean;
}

/** Tooltip preview shown when hovering a wiki-link */
export function WikiLinkPopover({ title, preview, position, visible }: WikiLinkPopoverProps) {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-[100] w-[260px] rounded-lg border border-obs-border",
        "bg-obs-bg-secondary p-3 shadow-2xl"
      )}
      style={{ top: position.top, left: position.left }}
    >
      <p className="mb-1 text-[12px] font-medium text-obs-accent">{title}</p>
      <p className="line-clamp-4 text-[12px] leading-relaxed text-obs-text-muted">{preview}</p>
    </div>
  );
}
