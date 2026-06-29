/**
 * Obsidian-style toggle switch for settings and preferences.
 */

"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** Accessible label for screen readers */
  label?: string;
}

/** Pill toggle with aligned thumb — matches Obsidian settings switches */
export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      data-checked={checked ? "true" : "false"}
      onClick={() => onChange(!checked)}
      className={cn(
        "obs-toggle",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <span className="obs-toggle-thumb" />
    </button>
  );
}
