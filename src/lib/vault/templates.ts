/**
 * Returns template notes from the vault (Templates/ folder or #template tag).
 */

import type { VaultFile } from "./types";
import { extractTags } from "./link-parser";

/** Finds all template files in the vault */
export function getTemplateFiles(files: VaultFile[]): VaultFile[] {
  return files.filter(
    (f) =>
      f.path.startsWith("Templates/") ||
      extractTags(f.content).includes("template")
  );
}

/** Substitutes template placeholders with current values */
export function processTemplateContent(content: string, noteTitle: string): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10);
  const timeStr = today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return content
    .replace(/YYYY-MM-DD/g, dateStr)
    .replace(/HH:mm/g, timeStr)
    .replace(/^#\s+.*$/m, `# ${noteTitle}`);
}
