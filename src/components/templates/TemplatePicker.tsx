/**
 * Modal for picking a note template to create a new note from.
 */

"use client";

import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTemplateFiles } from "@/lib/vault/templates";
import { useVaultStore } from "@/lib/vault/vault-store";
import { getFileDisplayName } from "@/lib/utils";

/** Template selection modal */
export function TemplatePicker() {
  const {
    isTemplatePickerOpen,
    setTemplatePickerOpen,
    templateTargetFolder,
    getAllFiles,
    createNoteFromTemplate,
  } = useVaultStore();

  const templates = getTemplateFiles(getAllFiles());

  if (!isTemplatePickerOpen) return null;

  return (
    <div
      className="obs-modal-overlay fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[20vh]"
      onClick={() => setTemplatePickerOpen(false)}
    >
      <div
        className="w-[min(420px,calc(100vw-2rem))] overflow-hidden border border-obs-border bg-obs-bg-secondary shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-obs-border px-4 py-3">
          <span className="text-[13px] font-medium text-obs-text">Insert template</span>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setTemplatePickerOpen(false)}
            className="rounded-sm p-0.5 text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[320px] overflow-y-auto py-1">
          {templates.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-obs-text-faint">
              No templates found. Add notes to Templates/ or tag with #template.
            </p>
          )}
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                "text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text"
              )}
              onClick={() => {
                createNoteFromTemplate(template.id, templateTargetFolder ?? undefined);
                setTemplatePickerOpen(false);
              }}
            >
              <FileText size={16} className="shrink-0 text-obs-accent" />
              <div>
                <p className="text-[13px] font-medium text-obs-text">
                  {getFileDisplayName(template.path)}
                </p>
                <p className="text-[11px] text-obs-text-faint">{template.path}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
