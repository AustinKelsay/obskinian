/**
 * Settings panel with preferences, theme, and plugin management.
 * Opened from the ribbon settings icon.
 */

"use client";

import { useEffect, useState } from "react";
import { Puzzle, Calendar, Clock, Palette, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from "@/lib/preferences";
import { ACCENT_COLORS, type AccentColor } from "@/lib/theme";
import { pluginRegistry } from "@/lib/plugins/registry";

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
      <div className="flex h-[36px] shrink-0 items-center border-b border-obs-border px-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-obs-text-muted">
          Settings
        </span>
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

          <label className="mb-2 flex cursor-pointer items-center justify-between py-1">
            <span className="text-[13px] text-obs-text-muted">Enable daily notes</span>
            <Toggle checked={prefs.dailyNotesEnabled} onChange={(v) => update({ dailyNotesEnabled: v })} />
          </label>

          <label className="mb-2 flex cursor-pointer items-center justify-between py-1">
            <span className="text-[13px] text-obs-text-muted">Open on startup</span>
            <Toggle checked={prefs.openDailyNoteOnStartup} onChange={(v) => update({ openDailyNoteOnStartup: v })} />
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
          <label className="flex cursor-pointer items-center justify-between py-1">
            <span className="text-[13px] text-obs-text-muted">Show recent files</span>
            <Toggle checked={prefs.showRecentInPalette} onChange={(v) => update({ showRecentInPalette: v })} />
          </label>
        </section>

        <section className="p-3">
          <div className="mb-3 flex items-center gap-2 text-[12px] font-medium text-obs-text">
            <Puzzle size={14} className="text-obs-accent" />
            Plugins
          </div>
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="mb-1 flex items-start gap-3 rounded-md px-2 py-2 hover:bg-obs-interactive-hover"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-obs-text">{plugin.name}</span>
                  <span className="text-[10px] text-obs-text-faint">v{plugin.version}</span>
                </div>
                <p className="text-[11px] text-obs-text-muted">{plugin.description}</p>
              </div>
              <Toggle checked disabled onChange={() => {}} />
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

/** Toggle switch matching Obsidian settings style */
function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors",
        checked ? "bg-obs-accent" : "bg-obs-interactive",
        disabled && "opacity-50"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
