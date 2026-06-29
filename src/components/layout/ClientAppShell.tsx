/**
 * Client-only app shell wrapper — avoids Zustand SSR snapshot issues.
 */

"use client";

import dynamic from "next/dynamic";

const AppShell = dynamic(
  () => import("@/components/layout/AppShell").then((mod) => mod.AppShell),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-obs-bg text-[13px] text-obs-text-faint">
        Loading Obskinian…
      </div>
    ),
  }
);

/** Renders the full Obsidian clone UI on the client only */
export function ClientAppShell() {
  return <AppShell />;
}
