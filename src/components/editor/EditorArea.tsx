/**
 * Split editor layout supporting vertical and horizontal pane splits.
 * Renders one or two NoteEditor panes side by side or stacked.
 */

"use client";

import { useVaultStore } from "@/lib/vault/vault-store";
import { NoteEditor } from "@/components/editor/NoteEditor";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

/** Multi-pane editor area with split support */
export function EditorArea() {
  const { panes, splitDirection, activePaneId, getPaneFile } = useVaultStore();
  const isMobile = useIsMobile();
  const effectiveSplit = isMobile && splitDirection === "vertical" ? "horizontal" : splitDirection;

  if (panes.length === 1) {
    const pane = panes[0];
    const file = getPaneFile(pane.id);
    if (!file) return null;
    return (
      <NoteEditor
        paneId={pane.id}
        fileId={file.id}
        content={file.content}
        frontmatter={file.frontmatter ?? {}}
        isActive
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full flex-1 overflow-hidden",
        effectiveSplit === "vertical" ? "flex-col md:flex-row" : "flex-col"
      )}
    >
      {panes.map((pane) => {
        const file = getPaneFile(pane.id);
        return (
          <div
            key={pane.id}
            className={cn(
              "flex-1 overflow-hidden",
              effectiveSplit === "vertical"
                ? "border-b border-obs-border md:border-b-0 md:border-r md:last:border-r-0"
                : "border-b border-obs-border last:border-b-0"
            )}
          >
            {file ? (
              <NoteEditor
                paneId={pane.id}
                fileId={file.id}
                content={file.content}
                frontmatter={file.frontmatter ?? {}}
                isActive={pane.id === activePaneId}
              />
            ) : (
              <EmptyPane paneId={pane.id} isActive={pane.id === activePaneId} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Empty pane placeholder when no file is assigned */
function EmptyPane({ paneId, isActive }: { paneId: string; isActive: boolean }) {
  const { setActivePane, createNote } = useVaultStore();

  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-3 bg-obs-bg text-obs-text-muted",
        isActive && "ring-1 ring-inset ring-obs-accent/30"
      )}
      onClick={() => setActivePane(paneId)}
    >
      <p className="text-[13px]">No note in this pane</p>
      <button
        type="button"
        onClick={() => createNote()}
        className="rounded-md bg-obs-accent/20 px-3 py-1.5 text-[12px] text-obs-accent hover:bg-obs-accent/30"
      >
        Create new note
      </button>
    </div>
  );
}
