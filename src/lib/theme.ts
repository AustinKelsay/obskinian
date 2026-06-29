/**
 * Theme definitions and application for Obsidian clone UI.
 * Supports dark (default) and light themes with accent color options.
 */

export type ThemeMode = "dark" | "light";

export type AccentColor = "purple" | "blue" | "green" | "orange" | "red";

export interface ThemeConfig {
  mode: ThemeMode;
  accent: AccentColor;
}

/** Accent color hex values */
export const ACCENT_COLORS: Record<AccentColor, { primary: string; hover: string; muted: string }> = {
  purple: { primary: "#7f6df2", hover: "#927aff", muted: "#483699" },
  blue: { primary: "#4a9eff", hover: "#6bb3ff", muted: "#1e4a7a" },
  green: { primary: "#4caf7c", hover: "#6bc995", muted: "#1e5a3a" },
  orange: { primary: "#e8973f", hover: "#f0ac5e", muted: "#7a4a1e" },
  red: { primary: "#e05555", hover: "#e87777", muted: "#7a1e1e" },
};

/** Dark theme CSS variable map */
const DARK_VARS: Record<string, string> = {
  "--color-obs-bg": "#1e1e1e",
  "--color-obs-bg-secondary": "#262626",
  "--color-obs-bg-tertiary": "#2a2a2a",
  "--color-obs-sidebar": "#202020",
  "--color-obs-ribbon": "#1a1a1a",
  "--color-obs-border": "#333333",
  "--color-obs-border-light": "#404040",
  "--color-obs-text": "#dcddde",
  "--color-obs-text-muted": "#999999",
  "--color-obs-text-faint": "#666666",
  "--color-obs-interactive": "#2e2e2e",
  "--color-obs-interactive-hover": "#363636",
  "--color-obs-selection": "#264f78",
  "--color-obs-tag": "#456882",
  "--color-obs-code-bg": "#1a1a1a",
  "--color-obs-scrollbar": "#404040",
};

/** Light theme CSS variable map */
const LIGHT_VARS: Record<string, string> = {
  "--color-obs-bg": "#ffffff",
  "--color-obs-bg-secondary": "#f5f5f5",
  "--color-obs-bg-tertiary": "#eeeeee",
  "--color-obs-sidebar": "#fafafa",
  "--color-obs-ribbon": "#f0f0f0",
  "--color-obs-border": "#e0e0e0",
  "--color-obs-border-light": "#d0d0d0",
  "--color-obs-text": "#222222",
  "--color-obs-text-muted": "#666666",
  "--color-obs-text-faint": "#999999",
  "--color-obs-interactive": "#eeeeee",
  "--color-obs-interactive-hover": "#e5e5e5",
  "--color-obs-selection": "#b4d5fe",
  "--color-obs-tag": "#c8dde8",
  "--color-obs-code-bg": "#f5f5f5",
  "--color-obs-scrollbar": "#cccccc",
};

/** Applies theme config to the document root */
export function applyTheme(config: ThemeConfig): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.setAttribute("data-theme", config.mode);

  const vars = config.mode === "dark" ? DARK_VARS : LIGHT_VARS;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }

  const accent = ACCENT_COLORS[config.accent];
  root.style.setProperty("--color-obs-accent", accent.primary);
  root.style.setProperty("--color-obs-accent-hover", accent.hover);
  root.style.setProperty("--color-obs-accent-muted", accent.muted);
  root.style.setProperty("--color-obs-link", accent.primary);
}
