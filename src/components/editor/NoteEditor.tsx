/**
 * Unified note editor supporting live (WYSIWYG) and source modes.
 * Wraps WysiwygEditor and SourceEditor with a mode toggle toolbar.
 */

"use client";

import {
  Eye,
  Code,
  Columns2,
  Rows2,
  X,
  Download,
  BookOpen,
  PanelsLeftRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { iconBtnClass } from "@/lib/ui-classes";
import type { EditorMode } from "@/lib/vault/types";
import { useVaultStore } from "@/lib/vault/vault-store";
import { downloadNoteAsHtml } from "@/lib/export";
import { WysiwygEditor } from "./WysiwygEditor";
import { SourceEditor } from "./SourceEditor";
import { ReadingView } from "./ReadingView";
import { SplitEditor } from "./SplitEditor";

interface NoteEditorProps {
  paneId: string;
  fileId: string;
  content: string;
  frontmatter?: Record<string, import("@/lib/vault/frontmatter").FrontmatterValue>;
  isActive: boolean;
}

interface ModeButtonProps {
  icon: LucideIcon;
  label: string;
  title: string;
  active: boolean;
  onClick: () => void;
}

/** Editor mode toggle — icon-only on narrow screens */
function ModeButton({ icon: Icon, label, title, active, onClick }: ModeButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-7 shrink-0 items-center gap-1 rounded-sm px-1.5 text-[11px] transition-colors sm:px-2",
        active
          ? "bg-obs-interactive-hover text-obs-accent"
          : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
      )}
    >
      <Icon size={12} className="shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Editor pane with live/source mode toggle and split controls */
export function NoteEditor({ paneId, fileId, content, frontmatter = {}, isActive }: NoteEditorProps) {
  const {
    panes,
    splitDirection,
    vault,
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
      <div className="flex h-[36px] shrink-0 items-center gap-0.5 overflow-x-auto border-b border-obs-border bg-obs-bg-secondary px-1 sm:gap-1 sm:px-2">
        <ModeButton
          icon={Eye}
          label="Live"
          title="Live preview (Ctrl+E)"
          active={editorMode === "live"}
          onClick={() => setPaneEditorMode(paneId, "live")}
        />
        <ModeButton
          icon={Code}
          label="Source"
          title="Source mode"
          active={editorMode === "source"}
          onClick={() => setPaneEditorMode(paneId, "source")}
        />
        <ModeButton
          icon={PanelsLeftRight}
          label="Split"
          title="Split preview (source + reading)"
          active={editorMode === "split"}
          onClick={() => setPaneEditorMode(paneId, "split")}
        />
        <ModeButton
          icon={BookOpen}
          label="Reading"
          title="Reading mode"
          active={editorMode === "reading"}
          onClick={() => setPaneEditorMode(paneId, "reading")}
        />

        <div className="min-w-2 flex-1" />

        <button
          type="button"
          title="Export as HTML"
          onClick={() =>
            downloadNoteAsHtml(
              useVaultStore.getState().getPaneFile(paneId)?.path ?? `${fileId}.md`,
              content,
              vault
            )
          }
          className={iconBtnClass}
        >
          <Download size={13} />
        </button>

        {splitDirection === "none" && (
          <div className="hidden items-center gap-0.5 sm:flex">
            <button
              type="button"
              title="Split vertically"
              onClick={() => splitPane("vertical")}
              className={iconBtnClass}
            >
              <Columns2 size={13} />
            </button>
            <button
              type="button"
              title="Split horizontally"
              onClick={() => splitPane("horizontal")}
              className={iconBtnClass}
            >
              <Rows2 size={13} />
            </button>
          </div>
        )}

        {splitDirection !== "none" && panes.length > 1 && paneId !== "pane-1" && (
          <button type="button" title="Close split" onClick={closeSplit} className={iconBtnClass}>
            <X size={13} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {editorMode === "live" && (
          <WysiwygEditor fileId={fileId} content={content} hideToolbar />
        )}
        {editorMode === "source" && (
          <SourceEditor fileId={fileId} content={content} frontmatter={frontmatter} />
        )}
        {editorMode === "split" && (
          <SplitEditor fileId={fileId} content={content} frontmatter={frontmatter} />
        )}
        {editorMode === "reading" && <ReadingView fileId={fileId} content={content} />}
      </div>
    </div>
  );
}
