/**
 * Client-only app shell wrapper — avoids Zustand SSR snapshot issues.
 */

"use client";

import { AppShell } from "./AppShell";

/** Renders the full Obsidian clone UI */
export function ClientAppShell() {
  return <AppShell />;
}
