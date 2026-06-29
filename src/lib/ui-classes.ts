/**
 * Shared Tailwind class strings for Obsidian-like panel chrome.
 * Keeps spacing, typography, and interactive states consistent app-wide.
 */

/** Standard left/right panel header row */
export const panelHeaderClass =
  "flex h-[36px] shrink-0 items-center justify-between border-b border-obs-border px-3";

/** Panel title label — Obsidian-style sentence case, not shouty uppercase */
export const panelTitleClass = "text-[12px] text-obs-text-muted";

/** Small section label inside panels (backlinks, properties groups) */
export const panelSectionClass =
  "px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wider text-obs-text-faint";

/** Standard empty-state copy inside sidebar panels */
export const panelEmptyClass = "px-3 py-4 text-[13px] text-obs-text-faint";

/** Icon-only chrome button (ribbon, toolbars, panel actions) */
export const iconBtnClass =
  "flex h-6 w-6 items-center justify-center rounded-sm text-obs-text-muted transition-colors hover:bg-obs-interactive-hover hover:text-obs-text focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-obs-accent";

/** Larger ribbon icon button */
export const ribbonBtnClass =
  "relative flex h-8 w-9 items-center justify-center rounded-sm transition-colors focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-[-1px] focus-visible:outline-obs-accent";

/** Flat search/filter field container */
export const searchFieldClass =
  "flex items-center gap-2 border-b border-obs-border bg-obs-sidebar px-3 py-2";

/** List row hover in sidebars */
export const listRowClass =
  "flex w-full text-left transition-colors hover:bg-obs-interactive-hover";
