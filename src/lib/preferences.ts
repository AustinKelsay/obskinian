/**
 * User preferences persisted to localStorage.
 * Controls daily notes, recent files, and UI behavior.
 */

export interface UserPreferences {
  dailyNotesEnabled: boolean;
  dailyNotesFolder: string;
  openDailyNoteOnStartup: boolean;
  showRecentInPalette: boolean;
}

const STORAGE_KEY = "obskinian-preferences";

const DEFAULTS: UserPreferences = {
  dailyNotesEnabled: true,
  dailyNotesFolder: "Daily Notes",
  openDailyNoteOnStartup: false,
  showRecentInPalette: true,
};

/** Loads preferences from localStorage */
export function loadPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

/** Saves preferences to localStorage */
export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = loadPreferences();
  const next = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Returns today's date string in YYYY-MM-DD format */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Builds the daily note path for a given date */
export function getDailyNotePath(folder: string, date?: string): string {
  const dateStr = date ?? getTodayDateString();
  return `${folder}/${dateStr}.md`;
}
