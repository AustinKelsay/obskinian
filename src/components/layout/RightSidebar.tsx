/**
 * Right sidebar panels: outline, backlinks, tags, and properties.
 * Obsidian-style vertical icon rail with resizable panel width.
 */

"use client";

import { ListTree, Link2, Tag, PanelRightClose, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  iconBtnClass,
  panelEmptyClass,
  panelSectionClass,
  panelTitleClass,
} from "@/lib/ui-classes";
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

const PANELS: { id: RightPanel; icon: React.ReactNode; label: string }[] = [
  { id: "outline", icon: <ListTree size={16} strokeWidth={1.5} />, label: "Outline" },
  { id: "backlinks", icon: <Link2 size={16} strokeWidth={1.5} />, label: "Backlinks" },
  { id: "tags", icon: <Tag size={16} strokeWidth={1.5} />, label: "Tags" },
  { id: "properties", icon: <FileJson size={16} strokeWidth={1.5} />, label: "Properties" },
];

/** Right sidebar with icon rail and tabbed panel content */
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
  const activePanel = PANELS.find((p) => p.id === rightPanel);

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
    <div className={cn("flex h-full shrink-0 flex-col border-l border-obs-border bg-obs-sidebar", className)}>
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[36px] shrink-0 flex-col items-center border-r border-obs-border bg-obs-bg-secondary py-1">
          {PANELS.map((panel) => (
            <button
              key={panel.id}
              type="button"
              title={panel.label}
              aria-label={panel.label}
              aria-current={rightPanel === panel.id ? "true" : undefined}
              onClick={() => setRightPanel(panel.id)}
              className={cn(
                "relative flex h-8 w-9 items-center justify-center rounded-sm transition-colors",
                rightPanel === panel.id
                  ? "bg-obs-interactive-hover text-obs-accent before:absolute before:inset-y-1.5 before:left-0 before:w-[2px] before:rounded-r before:bg-obs-accent"
                  : "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
              )}
            >
              {panel.icon}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-obs-border px-3">
            <span className={panelTitleClass}>{activePanel?.label}</span>
            <button
              type="button"
              title="Close sidebar"
              aria-label="Close sidebar"
              onClick={toggleRightSidebar}
              className={iconBtnClass}
            >
              <PanelRightClose size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightPanel === "outline" && (
              <div className="py-1">
                {!activeFile && <p className={panelEmptyClass}>No note open.</p>}
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
                  <p className={panelEmptyClass}>No headings found.</p>
                )}
              </div>
            )}

            {rightPanel === "backlinks" && (
              <div className="py-1">
                {!activeFile && <p className={panelEmptyClass}>No note open.</p>}

                {linkedBacklinks.length > 0 && (
                  <>
                    <p className={panelSectionClass}>
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
                    <p className={panelSectionClass}>
                      Unlinked mentions ({unlinkedMentions.length})
                    </p>
                    {unlinkedMentions.map((bl) => (
                      <BacklinkItem
                        key={`unlinked-${bl.fileId}`}
                        fileName={bl.fileName}
                        context={bl.context}
                        onClick={() => openFile(bl.fileId)}
                        onPromote={() =>
                          promoteUnlinkedMention(bl.fileId, activeFile!.name, bl.context)
                        }
                      />
                    ))}
                  </>
                )}

                {activeFile && linkedBacklinks.length === 0 && unlinkedMentions.length === 0 && (
                  <p className={panelEmptyClass}>No backlinks or mentions found.</p>
                )}
              </div>
            )}

            {rightPanel === "tags" && (
              <div className="p-3">
                {!activeFile && <p className={panelEmptyClass}>No note open.</p>}
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setLeftPanel("search");
                        setSearchQuery(`#${tag}`);
                      }}
                      className="rounded-sm bg-obs-tag/25 px-2 py-0.5 text-[12px] text-obs-text-muted transition-colors hover:bg-obs-tag/40 hover:text-obs-text"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {activeFile && tags.length === 0 && (
                  <p className={panelEmptyClass}>No tags found.</p>
                )}
              </div>
            )}

            {rightPanel === "properties" && activeFile && (
              <PropertiesPanel fileId={activeFile.id} frontmatter={activeFile.frontmatter ?? {}} />
            )}

            {rightPanel === "properties" && !activeFile && (
              <p className={panelEmptyClass}>No note open.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
