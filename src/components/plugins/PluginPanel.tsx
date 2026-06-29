/**
 * Plugin manager panel showing registered plugins.
 * Scaffold for future plugin enable/disable and settings UI.
 */

"use client";

import { Puzzle } from "lucide-react";
import { pluginRegistry } from "@/lib/plugins/registry";

/** Lists all registered plugins in the app */
export function PluginPanel() {
  const plugins = pluginRegistry.getAll();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[36px] shrink-0 items-center border-b border-obs-border px-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-obs-text-muted">
          Plugins
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {plugins.map((plugin) => (
          <div
            key={plugin.id}
            className="mb-1 flex items-start gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-obs-interactive-hover"
          >
            <Puzzle size={16} className="mt-0.5 shrink-0 text-obs-accent" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-obs-text">{plugin.name}</span>
                <span className="text-[10px] text-obs-text-faint">v{plugin.version}</span>
              </div>
              <p className="mt-0.5 text-[12px] text-obs-text-muted">{plugin.description}</p>
            </div>
            <div className="h-4 w-8 shrink-0 rounded-full bg-obs-accent/30">
              <div className="ml-auto h-4 w-4 rounded-full bg-obs-accent" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
