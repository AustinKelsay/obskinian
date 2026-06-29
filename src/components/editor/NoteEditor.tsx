/**
 * Unified note editor supporting live (WYSIWYG) and source modes.
 * Wraps WysiwygEditor and SourceEditor with a mode toggle toolbar.
 */

"use client";

import { Eye, Code, Columns2, Rows2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorMode } from "@/lib/vault/types";
import { useVaultStore } from "@/lib/vault/vault-store";
import { WysiwygEditor } from "./WysiwygEditor";
import { SourceEditor } from "./SourceEditor";

interface NoteEditorProps {
  paneId: string;
  fileId: string;
  content: string;
  isActive: boolean;
}

/** Editor pane with live/source mode toggle and split controls */
export function NoteEditor({ paneId, fileId, content, isActive }: NoteEditorProps) {
  const {
    panes,
    splitDirection,
    setPaneEditorMode,
    setActivePane,
    splitPane,
    closeSplit,
  } = useVaultStore();

  const pane = panes.find((p) => p.id === paneId);
  const editorMode: EditorMode = pane?.editorMode ?? "live";

  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden",
        isActive && splitDirection !== "none" && "ring-1 ring-inset ring-obs-accent/30"
      )}
      onClick={() => setActivePane(paneId)}
    >
      <div className="flex h-[30px] shrink-0 items-center gap-1 border-b border-obs-border bg-obs-bg-secondary px-2">
        <button
          type="button"
          title="Live preview (Ctrl+E)"
          onClick={() => setPaneEditorMode(paneId, "live")}
          className={cn(
            "flex h-6 items-center gap-1 rounded px-2 text-[11px] transition-colors",
            editorMode === "live"
              ? "bg-obs-accent/20 text-obs-accent"
              : "text-obs-text-muted hover:text-obs-text"
          )}
        >
          <Eye size={12} />
          Live
        </button>
        <button
          type="button"
          title="Source mode (Ctrl+E)"
          onClick={() => setPaneEditorMode(paneId, "source")}
          className={cn(
            "flex h-6 items-center gap-1 rounded px-2 text-[11px] transition-colors",
            editorMode === "source"
              ? "bg-obs-accent/20 text-obs-accent"
              : "text-obs-text-muted hover:text-obs-text"
          )}
        >
          <Code size={12} />
          Source
        </button>

        <div className="flex-1" />

        {splitDirection === "none" && (
          <>
            <button
              type="button"
              title="Split vertically"
              onClick={() => splitPane("vertical")}
              className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
            >
              <Columns2 size={13} />
            </button>
            <button
              type="button"
              title="Split horizontally"
              onClick={() => splitPane("horizontal")}
              className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
            >
              <Rows2 size={13} />
            </button>
          </>
        )}

        {splitDirection !== "none" && panes.length > 1 && paneId !== "pane-1" && (
          <button
            type="button"
            title="Close split"
            onClick={closeSplit}
            className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
          >
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {editorMode === "live" ? (
          <WysiwygEditor fileId={fileId} content={content} hideToolbar />
        ) : (
          <SourceEditor fileId={fileId} content={content} />
        )}
      </div>
    </div>
  );
}
