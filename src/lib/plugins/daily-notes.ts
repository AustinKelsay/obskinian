/**
 * Daily Notes plugin logic.
 * Creates and opens today's daily note on demand or at startup.
 */

import { getDailyNotePath, getTodayDateString, loadPreferences } from "@/lib/preferences";
import { useVaultStore } from "@/lib/vault/vault-store";

/** Opens or creates today's daily note */
export async function openDailyNote(): Promise<void> {
  const prefs = loadPreferences();
  const folder = prefs.dailyNotesFolder;
  const path = getDailyNotePath(folder);
  const store = useVaultStore.getState();
  const files = store.getAllFiles();

  const existing = files.find((f) => f.path === path);
  if (existing) {
    store.openFile(existing.id);
    return;
  }

  const dateStr = getTodayDateString();
  const content = `# ${dateStr}\n\n## Notes\n\n`;

  try {
    const res = await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", path, content, type: "file" }),
    });
    const data = await res.json();
    if (data.file) {
      const { addFileToTree } = await import("@/lib/vault/vault-data");
      useVaultStore.setState((state) => ({
        vault: addFileToTree(state.vault, data.file),
      }));
      store.openFile(data.file.id);
    }
  } catch {
    /* fallback handled by createNote flow */
    await store.createNote(folder);
  }
}

/** Opens daily note on startup if preference is enabled */
export async function maybeOpenDailyNoteOnStartup(): Promise<void> {
  const prefs = loadPreferences();
  if (!prefs.dailyNotesEnabled || !prefs.openDailyNoteOnStartup) return;
  await openDailyNote();
}
