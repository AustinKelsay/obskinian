/**
 * Server-side vault filesystem operations.
 * Reads and writes markdown files from the physical vault/ directory.
 */

import fs from "fs";
import path from "path";
import type { VaultFile, VaultFolder, VaultNode } from "./types";
import { pathToId } from "../utils";

const VAULT_ROOT = path.join(process.cwd(), "vault");

/** Recursively reads the vault directory into a tree structure */
export function readVaultFromDisk(): VaultFolder {
  const root: VaultFolder = {
    id: "vault-root",
    name: "Demo Vault",
    type: "folder",
    path: "",
    children: [],
    isExpanded: true,
  };

  if (!fs.existsSync(VAULT_ROOT)) {
    fs.mkdirSync(VAULT_ROOT, { recursive: true });
    return root;
  }

  root.children = readDirectory(VAULT_ROOT, "");
  sortChildren(root);
  return root;
}

/** Reads a directory recursively */
function readDirectory(dirPath: string, relativePath: string): VaultNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: VaultNode[] = [];

  for (const entry of entries) {
    const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      nodes.push({
        id: pathToId(entryRelPath),
        name: entry.name,
        type: "folder",
        path: entryRelPath,
        children: readDirectory(fullPath, entryRelPath),
        isExpanded: true,
      });
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      const stat = fs.statSync(fullPath);
      nodes.push({
        id: pathToId(entryRelPath),
        name: entry.name,
        type: "file",
        path: entryRelPath,
        content: fs.readFileSync(fullPath, "utf-8"),
        createdAt: stat.birthtime.toISOString(),
        modifiedAt: stat.mtime.toISOString(),
      });
    }
  }

  sortNodes(nodes);
  return nodes;
}

/** Sorts nodes with folders first, then alphabetically */
function sortNodes(nodes: VaultNode[]): void {
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function sortChildren(folder: VaultFolder): void {
  sortNodes(folder.children);
  for (const child of folder.children) {
    if (child.type === "folder") sortChildren(child);
  }
}

/** Writes file content to disk */
export function writeFileToDisk(filePath: string, content: string): void {
  const fullPath = path.join(VAULT_ROOT, filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(fullPath, content, "utf-8");
}

/** Creates a new markdown file on disk */
export function createFileOnDisk(filePath: string, content = ""): VaultFile {
  const fullPath = path.join(VAULT_ROOT, filePath);
  if (fs.existsSync(fullPath)) throw new Error(`File already exists: ${filePath}`);

  writeFileToDisk(filePath, content);
  const stat = fs.statSync(fullPath);
  const segments = filePath.split("/");

  return {
    id: pathToId(filePath),
    name: segments[segments.length - 1],
    type: "file",
    path: filePath,
    content,
    createdAt: stat.birthtime.toISOString(),
    modifiedAt: stat.mtime.toISOString(),
  };
}

/** Creates a folder on disk */
export function createFolderOnDisk(folderPath: string): void {
  const fullPath = path.join(VAULT_ROOT, folderPath);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
}

/** Deletes a file or folder from disk */
export function deleteFromDisk(targetPath: string): void {
  const fullPath = path.join(VAULT_ROOT, targetPath);
  if (!fs.existsSync(fullPath)) throw new Error(`Not found: ${targetPath}`);

  const stat = fs.statSync(fullPath);
  if (stat.isDirectory()) {
    fs.rmSync(fullPath, { recursive: true });
  } else {
    fs.unlinkSync(fullPath);
  }
}

/** Renames or moves a file/folder on disk */
export function renameOnDisk(oldPath: string, newPath: string): void {
  const oldFull = path.join(VAULT_ROOT, oldPath);
  const newFull = path.join(VAULT_ROOT, newPath);

  if (!fs.existsSync(oldFull)) throw new Error(`Not found: ${oldPath}`);
  if (fs.existsSync(newFull)) throw new Error(`Already exists: ${newPath}`);

  const dir = path.dirname(newFull);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.renameSync(oldFull, newFull);
}

/** Returns the absolute vault root path */
export function getVaultRoot(): string {
  return VAULT_ROOT;
}
