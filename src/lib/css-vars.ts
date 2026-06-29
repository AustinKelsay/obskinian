/**
 * Reads Obsidian theme CSS variables from the document root.
 * Used by canvas-based views (graph) that cannot use Tailwind tokens directly.
 */

interface ObsidianCssColors {
  bg: string;
  accent: string;
  accentHover: string;
  text: string;
  textMuted: string;
  textFaint: string;
  border: string;
}

const FALLBACK: ObsidianCssColors = {
  bg: "#1e1e1e",
  accent: "#7f6df2",
  accentHover: "#927aff",
  text: "#dcddde",
  textMuted: "#999999",
  textFaint: "#666666",
  border: "#333333",
};

/** Returns current theme colors from CSS custom properties */
export function readObsidianCssColors(): ObsidianCssColors {
  if (typeof document === "undefined") return FALLBACK;

  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  return {
    bg: read("--color-obs-bg", FALLBACK.bg),
    accent: read("--color-obs-accent", FALLBACK.accent),
    accentHover: read("--color-obs-accent-hover", FALLBACK.accentHover),
    text: read("--color-obs-text", FALLBACK.text),
    textMuted: read("--color-obs-text-muted", FALLBACK.textMuted),
    textFaint: read("--color-obs-text-faint", FALLBACK.textFaint),
    border: read("--color-obs-border", FALLBACK.border),
  };
}
