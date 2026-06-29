/**
 * Note properties panel — displays and edits YAML frontmatter fields.
 */

"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { FrontmatterValue } from "@/lib/vault/frontmatter";
import { useVaultStore } from "@/lib/vault/vault-store";

interface PropertiesPanelProps {
  fileId: string;
  frontmatter: Record<string, FrontmatterValue>;
}

/** Renders editable frontmatter properties for the active note */
export function PropertiesPanel({ fileId, frontmatter }: PropertiesPanelProps) {
  const updateFrontmatter = useVaultStore((s) => s.updateFrontmatter);
  const [newKey, setNewKey] = useState("");

  const entries = Object.entries(frontmatter);

  function setField(key: string, value: FrontmatterValue) {
    updateFrontmatter(fileId, { ...frontmatter, [key]: value });
  }

  function removeField(key: string) {
    const next = { ...frontmatter };
    delete next[key];
    updateFrontmatter(fileId, next);
  }

  function addField() {
    const key = newKey.trim();
    if (!key || frontmatter[key] !== undefined) return;
    setField(key, "");
    setNewKey("");
  }

  return (
    <div className="py-1">
      {entries.length === 0 && (
        <p className="px-3 py-4 text-[13px] text-obs-text-faint">
          No properties. Add YAML frontmatter fields below.
        </p>
      )}

      {entries.map(([key, value]) => (
        <div key={key} className="border-b border-obs-border/50 px-3 py-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-obs-text-faint">
              {key}
            </span>
            <button
              type="button"
              title="Remove property"
              aria-label={`Remove ${key}`}
              onClick={() => removeField(key)}
              className="flex h-5 w-5 items-center justify-center rounded text-obs-text-faint hover:bg-obs-interactive-hover hover:text-red-400"
            >
              <Trash2 size={11} />
            </button>
          </div>
          <PropertyValueInput
            value={value}
            onChange={(v) => setField(key, v)}
          />
        </div>
      ))}

      <div className="flex items-center gap-1 px-3 py-3">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addField()}
          placeholder="New property..."
          className="flex-1 rounded border border-obs-border bg-obs-interactive px-2 py-1 text-[12px] text-obs-text outline-none focus:border-obs-accent"
        />
        <button
          type="button"
          title="Add property"
          onClick={addField}
          className="flex h-7 w-7 items-center justify-center rounded bg-obs-accent/20 text-obs-accent hover:bg-obs-accent/30"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

/** Input for a single frontmatter value */
function PropertyValueInput({
  value,
  onChange,
}: {
  value: FrontmatterValue;
  onChange: (v: FrontmatterValue) => void;
}) {
  if (Array.isArray(value)) {
    return (
      <input
        type="text"
        value={value.join(", ")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
        className="w-full rounded border border-obs-border bg-obs-bg px-2 py-1 text-[13px] text-obs-text outline-none focus:border-obs-accent"
      />
    );
  }

  if (typeof value === "boolean") {
    return (
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="rounded px-2 py-0.5 text-[12px] text-obs-accent hover:bg-obs-interactive-hover"
      >
        {value ? "true" : "false"}
      </button>
    );
  }

  return (
    <input
      type="text"
      value={String(value)}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded border border-obs-border bg-obs-bg px-2 py-1 text-[13px] text-obs-text outline-none focus:border-obs-accent"
    />
  );
}
