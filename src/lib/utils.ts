/**
 * Utility helpers for class names and common string operations.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind class names with conflict resolution */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extracts display name from a file path (without extension) */
export function getFileDisplayName(path: string): string {
  const segments = path.split("/");
  const fileName = segments[segments.length - 1] ?? path;
  return fileName.replace(/\.md$/, "");
}

/** Counts words in a markdown string */
export function countWords(text: string): number {
  const stripped = text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*`~\[\]()>-]/g, " ")
    .trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

/** Counts characters in text */
export function countCharacters(text: string): number {
  return text.length;
}

/** Generates a unique id from a path */
export function pathToId(path: string): string {
  return path.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}
