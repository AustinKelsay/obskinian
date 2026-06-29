/**
 * Utilities for promoting plain-text mentions to wiki-links.
 */

/** Escapes regex special characters */
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Replaces the first unlinked mention of targetName in content with a wiki-link */
export function promoteMentionInContent(
  content: string,
  targetName: string,
  contextLine?: string
): string | null {
  const mention = targetName.replace(/\.md$/, "");
  const pattern = new RegExp(`\\b${escapeRegex(mention)}\\b`);

  const lines = content.split("\n");
  const startIdx = contextLine
    ? lines.findIndex((l) => l.trim() === contextLine.trim())
    : lines.findIndex((l) => pattern.test(l) && !l.includes(`[[${mention}`));

  if (startIdx < 0) return null;

  const line = lines[startIdx];
  if (line.includes(`[[${mention}`)) return null;

  lines[startIdx] = line.replace(pattern, `[[${mention}]]`);
  return lines.join("\n");
}
