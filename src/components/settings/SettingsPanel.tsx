/**
 * Settings panel with preferences, theme, and plugin management.
 * Opened from the ribbon settings icon.
 */

"use client";

import { useEffect, useState } from "react";
import { Puzzle, Calendar, Clock, Palette, Sun, Moon, Code2, Layout } from "lucide-react";
import { cn } from "@/lib/utils";
import { panelHeaderClass, panelTitleClass } from "@/lib/ui-classes";
import {
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/preferences";
import { ACCENT_COLORS, type AccentColor } from "@/lib/theme";
import { pluginRegistry } from "@/lib/plugins/registry";
import { Toggle } from "@/components/ui/Toggle";

/** Left sidebar settings panel */
export function SettingsPanel() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);
  const plugins = pluginRegistry.getAll();

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  function update(partial: Partial<UserPreferences>) {
    const next = savePreferences(partial);
    setPrefs(next);
  }

  return (
    <div className="flex h-full flex-col">
      <div className={panelHeaderClass}>
        <span className={panelTitleClass}>Settings</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <section className="border-b border-obs-border p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Palette size={14} className="text-obs-accent" />
            Appearance
          </div>

          <div className="mb-3 flex gap-1">
            <ThemeButton
              active={prefs.theme === "dark"}
              onClick={() => update({ theme: "dark" })}
              icon={<Moon size={14} />}
              label="Dark"
            />
            <ThemeButton
              active={prefs.theme === "light"}
              onClick={() => update({ theme: "light" })}
              icon={<Sun size={14} />}
              label="Light"
            />
          </div>

          <p className="mb-2 text-[11px] text-obs-text-faint">Accent color</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ACCENT_COLORS) as AccentColor[]).map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                aria-label={`Accent color ${color}`}
                onClick={() => update({ accent: color })}
                className={cn(
                  "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                  prefs.accent === color ? "border-obs-text scale-110" : "border-transparent"
                )}
                style={{ background: ACCENT_COLORS[color].primary }}
              />
            ))}
          </div>
        </section>

        <section className="border-b border-obs-border p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Calendar size={14} className="text-obs-accent" />
            Daily Notes
          </div>

          <label className="obs-setting-row mb-2 cursor-pointer">
            <span>Enable daily notes</span>
            <Toggle
              checked={prefs.dailyNotesEnabled}
              onChange={(v) => update({ dailyNotesEnabled: v })}
              label="Enable daily notes"
            />
          </label>

          <label className="obs-setting-row mb-2 cursor-pointer">
            <span>Open on startup</span>
            <Toggle
              checked={prefs.openDailyNoteOnStartup}
              onChange={(v) => update({ openDailyNoteOnStartup: v })}
              label="Open daily note on startup"
            />
          </label>

          <div className="mt-2">
            <label className="text-[11px] text-obs-text-faint">Folder</label>
            <input
              type="text"
              value={prefs.dailyNotesFolder}
              onChange={(e) => update({ dailyNotesFolder: e.target.value })}
              className="mt-1 w-full rounded-md border border-obs-border bg-obs-interactive px-2 py-1.5 text-[13px] text-obs-text outline-none focus:border-obs-accent"
            />
          </div>
        </section>

        <section className="border-b border-obs-border p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Clock size={14} className="text-obs-accent" />
            Command Palette
          </div>
          <label className="obs-setting-row cursor-pointer">
            <span>Show recent files</span>
            <Toggle
              checked={prefs.showRecentInPalette}
              onChange={(v) => update({ showRecentInPalette: v })}
              label="Show recent files in command palette"
            />
          </label>
        </section>

        <section className="border-b border-obs-border p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Layout size={14} className="text-obs-accent" />
            Workspace
          </div>
          <label className="obs-setting-row cursor-pointer">
            <span>Restore layout on load</span>
            <Toggle
              checked={prefs.restoreWorkspaceOnLoad}
              onChange={(v) => update({ restoreWorkspaceOnLoad: v })}
              label="Restore workspace layout on load"
            />
          </label>
          <p className="mt-1 text-[11px] text-obs-text-faint">
            Saves open tabs and sidebar state between sessions.
          </p>
        </section>

        <section className="border-b border-obs-border p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Code2 size={14} className="text-obs-accent" />
            Custom CSS
          </div>
          <textarea
            value={prefs.customCss}
            onChange={(e) => update({ customCss: e.target.value })}
            placeholder={".markdown-preview-view {\n  font-size: 16px;\n}"}
            spellCheck={false}
            className="h-[120px] w-full resize-y rounded-md border border-obs-border bg-obs-interactive px-2 py-1.5 font-mono text-[12px] text-obs-text outline-none focus:border-obs-accent"
          />
          <p className="mt-1 text-[11px] text-obs-text-faint">
            CSS injected into the app. Use for personal styling tweaks.
          </p>
        </section>

        <section className="p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Puzzle size={14} className="text-obs-accent" />
            Plugins
          </div>
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="mb-1 flex items-center gap-3 rounded-sm px-2 py-2 hover:bg-obs-interactive-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-obs-text">{plugin.name}</span>
                  <span className="text-[10px] text-obs-text-faint">v{plugin.version}</span>
                </div>
                <p className="text-[11px] leading-snug text-obs-text-muted">{plugin.description}</p>
              </div>
              <Toggle checked disabled onChange={() => {}} label={`${plugin.name} enabled`} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

/** Theme mode selector button */
function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-[12px] transition-colors",
        active
          ? "border-obs-accent bg-obs-accent/15 text-obs-accent"
          : "border-obs-border text-obs-text-muted hover:bg-obs-interactive-hover"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
