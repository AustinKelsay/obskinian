/**
 * Right sidebar panels: outline, backlinks, tags, and properties.
 * Provides contextual information about the active note.
 */

"use client";

import { ListTree, Link2, Tag, PanelRightClose, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RightPanel } from "@/lib/vault/types";
import { useVaultStore } from "@/lib/vault/vault-store";
import {
  extractHeadings,
  extractTags,
  findLinkedBacklinks,
  findUnlinkedMentions,
  extractLinkFromContext,
} from "@/lib/vault/link-parser";
import { BacklinkItem } from "@/components/backlinks/BacklinkItem";
import { PropertiesPanel } from "@/components/properties/PropertiesPanel";

/** Right sidebar with tabbed panels */
export function RightSidebar({ className }: { className?: string }) {
  const {
    rightPanel,
    setRightPanel,
    isRightSidebarOpen,
    toggleRightSidebar,
    getActiveFile,
    getAllFiles,
    openFile,
    openFileByLink,
    setLeftPanel,
    setSearchQuery,
    scrollToHeading,
    promoteUnlinkedMention,
  } = useVaultStore();

  const activeFile = getActiveFile();
  const allFiles = getAllFiles();

  const panels: { id: RightPanel; icon: React.ReactNode; label: string }[] = [
    { id: "outline", icon: <ListTree size={14} />, label: "Outline" },
    { id: "backlinks", icon: <Link2 size={14} />, label: "Backlinks" },
    { id: "tags", icon: <Tag size={14} />, label: "Tags" },
    { id: "properties", icon: <FileJson size={14} />, label: "Props" },
  ];

  const headings = activeFile ? extractHeadings(activeFile.content) : [];
  const linkedBacklinks = activeFile
    ? findLinkedBacklinks(activeFile.name, allFiles)
    : [];
  const unlinkedMentions = activeFile
    ? findUnlinkedMentions(activeFile.name, allFiles)
    : [];
  const tags = activeFile ? extractTags(activeFile.content) : [];

  if (!isRightSidebarOpen) return null;

  return (
    <div className={cn("flex h-full w-[260px] shrink-0 flex-col border-l border-obs-border bg-obs-sidebar", className)}>
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-obs-border px-2">
        <div className="flex items-center gap-0.5 overflow-x-auto">
          {panels.map((panel) => (
            <button
              key={panel.id}
              type="button"
              title={panel.label}
              aria-label={panel.label}
              onClick={() => setRightPanel(panel.id)}
              className={cn(
                "flex h-7 shrink-0 items-center gap-1 rounded px-2 text-[11px] transition-colors",
                rightPanel === panel.id
                  ? "bg-obs-accent/15 text-obs-accent"
                  : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
              )}
            >
              {panel.icon}
              <span>{panel.label}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          title="Close sidebar"
          aria-label="Close sidebar"
          onClick={toggleRightSidebar}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
        >
          <PanelRightClose size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rightPanel === "outline" && (
          <div className="py-1">
            {!activeFile && (
              <p className="px-3 py-4 text-[13px] text-obs-text-faint">No note open.</p>
            )}
            {headings.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => scrollToHeading(h.id)}
                className="flex w-full cursor-pointer truncate px-3 py-[3px] text-left text-[13px] text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text"
                style={{ paddingLeft: `${(h.level - 1) * 12 + 12}px` }}
              >
                {h.text}
              </button>
            ))}
            {activeFile && headings.length === 0 && (
              <p className="px-3 py-4 text-[13px] text-obs-text-faint">No headings found.</p>
            )}
          </div>
        )}

        {rightPanel === "backlinks" && (
          <div className="py-1">
            {!activeFile && (
              <p className="px-3 py-4 text-[13px] text-obs-text-faint">No note open.</p>
            )}

            {linkedBacklinks.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-obs-text-faint">
                  Linked mentions ({linkedBacklinks.length})
                </p>
                {linkedBacklinks.map((bl) => (
                  <BacklinkItem
                    key={`linked-${bl.fileId}`}
                    fileName={bl.fileName}
                    context={bl.context}
                    onClick={() => {
                      const link = extractLinkFromContext(bl.context, activeFile!.name);
                      if (link) openFileByLink(link);
                      else openFile(bl.fileId);
                    }}
                  />
                ))}
              </>
            )}

            {unlinkedMentions.length > 0 && (
              <>
                <p className="px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-obs-text-faint">
                  Unlinked mentions ({unlinkedMentions.length})
                </p>
                {unlinkedMentions.map((bl) => (
                  <BacklinkItem
                    key={`unlinked-${bl.fileId}`}
                    fileName={bl.fileName}
                    context={bl.context}
                    onClick={() => openFile(bl.fileId)}
                    onPromote={() =>
                      promoteUnlinkedMention(
                        bl.fileId,
                        activeFile!.name,
                        bl.context
                      )
                    }
                  />
                ))}
              </>
            )}

            {activeFile && linkedBacklinks.length === 0 && unlinkedMentions.length === 0 && (
              <p className="px-3 py-4 text-[13px] text-obs-text-faint">
                No backlinks or mentions found.
              </p>
            )}
          </div>
        )}

        {rightPanel === "tags" && (
          <div className="flex flex-wrap gap-1.5 p-3">
            {!activeFile && (
              <p className="text-[13px] text-obs-text-faint">No note open.</p>
            )}
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setLeftPanel("search");
                  setSearchQuery(`#${tag}`);
                }}
                className="rounded-full bg-obs-tag/30 px-2.5 py-0.5 text-[12px] text-obs-text-muted transition-colors hover:bg-obs-tag/50 hover:text-obs-text"
              >
                #{tag}
              </button>
            ))}
            {activeFile && tags.length === 0 && (
              <p className="text-[13px] text-obs-text-faint">No tags found.</p>
            )}
          </div>
        )}

        {rightPanel === "properties" && activeFile && (
          <PropertiesPanel fileId={activeFile.id} frontmatter={activeFile.frontmatter ?? {}} />
        )}

        {rightPanel === "properties" && !activeFile && (
          <p className="px-3 py-4 text-[13px] text-obs-text-faint">No note open.</p>
        )}
      </div>
    </div>
  );
}
