/**
 * Side-by-side source editor and reading preview (Obsidian split preview).
 * Stacks vertically on narrow viewports; draggable divider on desktop.
 */

"use client";

import { useCallback, useRef } from "react";
import type { FrontmatterValue } from "@/lib/vault/frontmatter";
import { useHorizontalSplit } from "@/hooks/use-horizontal-split";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { SourceEditor } from "./SourceEditor";
import { ReadingView } from "./ReadingView";

interface SplitEditorProps {
  fileId: string;
  content: string;
  frontmatter?: Record<string, FrontmatterValue>;
}

/** Source + rendered preview in a resizable split layout */
export function SplitEditor({ fileId, content, frontmatter = {} }: SplitEditorProps) {
  const isMobile = useIsMobile();
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  const { ratio, containerRef, isDragging, startDrag } = useHorizontalSplit({
    storageKey: "obskinian-split-ratio",
  });

  /** Maps source scroll position to the reading preview */
  const handleSourceScroll = useCallback((scrollRatio: number) => {
    if (isSyncingScroll.current) return;
    const preview = previewRef.current;
    if (!preview) return;

    isSyncingScroll.current = true;
    const maxScroll = preview.scrollHeight - preview.clientHeight;
    preview.scrollTop = scrollRatio * maxScroll;
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  }, []);

  if (isMobile) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="h-1/2 min-h-0 overflow-hidden border-b border-obs-border">
          <SourceEditor
            fileId={fileId}
            content={content}
            frontmatter={frontmatter}
            layout="split"
            showLineNumbers
          />
        </div>
        <div className="h-1/2 min-h-0 overflow-hidden">
          <ReadingView fileId={fileId} content={content} layout="split" scrollRef={previewRef} />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex h-full overflow-hidden">
      <div
        className="h-full min-w-0 overflow-hidden border-r border-obs-border"
        style={{ width: `${ratio * 100}%` }}
      >
        <SourceEditor
          fileId={fileId}
          content={content}
          frontmatter={frontmatter}
          layout="split"
          showLineNumbers
          onScrollRatioChange={handleSourceScroll}
        />
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize split preview"
        onPointerDown={startDrag}
        className={cn(
          "group relative z-10 w-1 shrink-0 cursor-col-resize bg-obs-border transition-colors hover:bg-obs-accent/50",
          isDragging && "bg-obs-accent/60"
        )}
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      <div
        className="h-full min-w-0 flex-1 overflow-hidden"
        style={{ width: `${(1 - ratio) * 100}%` }}
      >
        <ReadingView fileId={fileId} content={content} layout="split" scrollRef={previewRef} />
      </div>
    </div>
  );
}
