/**
 * Demo vault data loader.
 * Builds the vault tree from embedded markdown file definitions
 * that mirror the physical files in /vault.
 */

import type { VaultFile, VaultFolder, VaultNode } from "./types";
import { pathToId } from "../utils";

/** Raw vault file entry used to seed the demo vault */
interface VaultFileEntry {
  path: string;
  content: string;
}

const DEMO_FILES: VaultFileEntry[] = [
  {
    path: "Welcome.md",
    content: `# Welcome to Obskinian

This is a **skin-deep clone** of [Obsidian](https://obsidian.md) — a local-first knowledge base built for thinking.

## Getting Started

Obsidian stores your notes in a **vault** — a folder of plain-text Markdown files. This demo vault includes:

- Real folder structure with nested notes
- [[Graph View]] connections via wiki-links
- WYSIWYG editing experience
- File explorer, search, and outline panels

## Key Features (Demo)

- [x] File explorer with folders
- [x] Tabbed note editing
- [x] Graph visualization
- [x] Wiki-link syntax \`[[like this]]\`
- [ ] Plugin system (coming soon)
- [ ] Sync (coming soon)

## Quick Links

Explore these connected notes:

- [[Daily Notes/2024-06-15]]
- [[Projects/Obsidian Clone]]
- [[Knowledge Graph Theory]]
- [[Templates/Meeting Notes]]

## Tags

#welcome #getting-started #demo

---

> "A second brain, for you, forever." — Obsidian tagline

Use the **left ribbon** to switch between File Explorer, Search, and Graph View. Click any \`[[wiki-link]]\` to navigate between notes.`,
  },
  {
    path: "Graph View.md",
    content: `# Graph View

The **Graph View** visualizes connections between your notes. Each node represents a note, and edges represent \`[[wiki-links]]\`.

## How It Works

When you create a link like \`[[Knowledge Graph Theory]]\`, Obsidian draws a connection between the two notes in the graph.

## Graph Controls

- **Zoom**: Scroll wheel
- **Pan**: Click and drag background
- **Focus**: Click a node to open that note
- **Filter**: Use the search box to highlight specific notes

## Related Notes

- [[Welcome]]
- [[Knowledge Graph Theory]]
- [[Projects/Obsidian Clone]]
- [[MOC - Knowledge Management]]

#graph #visualization #connections`,
  },
  {
    path: "Knowledge Graph Theory.md",
    content: `# Knowledge Graph Theory

A **knowledge graph** connects ideas through relationships rather than rigid hierarchies.

## Core Concepts

### Nodes
Each note is a node — an atomic unit of knowledge.

### Edges
Wiki-links create edges between nodes:
- \`[[Welcome]]\` links to the Welcome note
- Bidirectional connections emerge naturally

### Clusters
Related notes form **clusters** — visible in [[Graph View]] as tightly connected groups.

## Zettelkasten Method

1. **Fleeting notes** — quick captures
2. **Literature notes** — from sources
3. **Permanent notes** — refined ideas
4. **Structure notes** — maps of content (MOCs)

See also: [[MOC - Knowledge Management]]

#theory #zettelkasten #knowledge-management`,
  },
  {
    path: "MOC - Knowledge Management.md",
    content: `# MOC - Knowledge Management

> Map of Content — an index note linking to related topics.

## Areas

- [[Knowledge Graph Theory]]
- [[Graph View]]
- [[Templates/Meeting Notes]]

## Projects

- [[Projects/Obsidian Clone]]
- [[Projects/Website Redesign]]

## Daily Notes

- [[Daily Notes/2024-06-15]]
- [[Daily Notes/2024-06-16]]

#moc #index`,
  },
  {
    path: "Daily Notes/2024-06-15.md",
    content: `# 2024-06-15

## Morning

Started working on the [[Projects/Obsidian Clone]] project. Goal is to replicate the Obsidian UI as closely as possible.

## Tasks

- [x] Set up project boilerplate
- [x] Create demo vault with sample notes
- [ ] Implement graph view
- [ ] Polish WYSIWYG editor styling

## Notes

The [[Graph View]] should use force-directed layout similar to Obsidian's implementation. Need to research \`d3-force\` or similar libraries.

Connected ideas from [[Knowledge Graph Theory]] — the zettelkasten method fits perfectly here.

#daily #journal`,
  },
  {
    path: "Daily Notes/2024-06-16.md",
    content: `# 2024-06-16

## Morning

Continued UI polish on the Obsidian clone. The ribbon and sidebar feel very close to the real thing.

## Tasks

- [x] Match Obsidian color palette
- [x] Add tab bar with close buttons
- [ ] Right sidebar outline panel
- [ ] Backlinks panel

## Reflection

Reading about [[Knowledge Graph Theory]] again. The graph really is the killer feature — seeing connections emerge from your writing is magical.

#daily #journal`,
  },
  {
    path: "Projects/Obsidian Clone.md",
    content: `# Obsidian Clone

Building a front-end clone of Obsidian as a scaffold for future full implementation.

## Goals

1. **Pixel-perfect UI** — match Obsidian's dark theme, layout, and interactions
2. **Demo vault** — real files and folders with wiki-link connections
3. **WYSIWYG editor** — what-you-see-is-what-you-get editing
4. **Graph view** — force-directed note visualization

## Related

- [[Welcome]]
- [[Graph View]]
- [[Knowledge Graph Theory]]
- [[Projects/Website Redesign]]

#project #obsidian #development`,
  },
  {
    path: "Projects/Website Redesign.md",
    content: `# Website Redesign

Planning a complete redesign of the company website.

## Requirements

- Modern, clean aesthetic
- Fast page loads
- Mobile-first responsive design
- CMS integration

## Inspiration

Taking cues from [[Projects/Obsidian Clone]] for the dark theme option.

## Timeline

- [ ] Wireframes
- [ ] Design system
- [ ] Frontend development
- [ ] Content migration

#project #web #design`,
  },
  {
    path: "Templates/Meeting Notes.md",
    content: `# Meeting Notes

## Template

**Date:** YYYY-MM-DD
**Attendees:**

## Agenda

1.

## Discussion

-

## Action Items

- [ ]

## Related Notes

- [[MOC - Knowledge Management]]

---

*Duplicate this template for new meetings.*

#template #meetings`,
  },
];

/** Creates a VaultFile from a path and content string */
function createFile(path: string, content: string): VaultFile {
  const segments = path.split("/");
  const name = segments[segments.length - 1];
  const now = new Date().toISOString();
  return {
    id: pathToId(path),
    name,
    type: "file",
    path,
    content,
    createdAt: now,
    modifiedAt: now,
  };
}

/** Inserts a file into the folder tree at the given path segments */
function insertFile(root: VaultFolder, pathSegments: string[], file: VaultFile): void {
  if (pathSegments.length === 1) {
    root.children.push(file);
    return;
  }

  const folderName = pathSegments[0];
  let folder = root.children.find(
    (c): c is VaultFolder => c.type === "folder" && c.name === folderName
  );

  if (!folder) {
    folder = {
      id: pathToId(`${root.path}/${folderName}`),
      name: folderName,
      type: "folder",
      path: root.path ? `${root.path}/${folderName}` : folderName,
      children: [],
      isExpanded: true,
    };
    root.children.push(folder);
  }

  insertFile(folder, pathSegments.slice(1), file);
}

/** Builds the complete vault tree from demo file entries */
export function buildVaultTree(): VaultFolder {
  const root: VaultFolder = {
    id: "vault-root",
    name: "Demo Vault",
    type: "folder",
    path: "",
    children: [],
    isExpanded: true,
  };

  for (const entry of DEMO_FILES) {
    const segments = entry.path.split("/");
    const file = createFile(entry.path, entry.content);
    insertFile(root, segments, file);
  }

  root.children.sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return root;
}

/** Flattens the vault tree into a list of all files */
export function flattenVaultFiles(node: VaultNode): VaultFile[] {
  if (node.type === "file") return [node];
  return node.children.flatMap(flattenVaultFiles);
}

/** Finds a file by id in the vault tree */
export function findFileById(node: VaultNode, id: string): VaultFile | null {
  if (node.type === "file") return node.id === id ? node : null;
  for (const child of node.children) {
    const found = findFileById(child, id);
    if (found) return found;
  }
  return null;
}

/** Finds a file by path or wiki-link name */
export function findFileByLink(node: VaultNode, link: string): VaultFile | null {
  const normalized = link.replace(/\.md$/, "").toLowerCase();

  function search(n: VaultNode): VaultFile | null {
    if (n.type === "file") {
      const filePath = n.path.replace(/\.md$/, "").toLowerCase();
      const fileName = n.name.replace(/\.md$/, "").toLowerCase();
      if (filePath === normalized || fileName === normalized) return n;
      if (filePath.endsWith(`/${normalized}`)) return n;
      return null;
    }
    for (const child of n.children) {
      const found = search(child);
      if (found) return found;
    }
    return null;
  }

  return search(node);
}

/** Toggles folder expanded state in the tree (immutable update) */
export function toggleFolderExpanded(node: VaultNode, folderId: string): VaultNode {
  if (node.type === "file") return node;
  if (node.id === folderId) {
    return { ...node, isExpanded: !node.isExpanded };
  }
  return {
    ...node,
    children: node.children.map((c) => toggleFolderExpanded(c, folderId)),
  };
}

/** Updates file content in the tree (immutable update) */
export function updateFileContent(node: VaultNode, fileId: string, content: string): VaultNode {
  if (node.type === "file") {
    if (node.id !== fileId) return node;
    return { ...node, content, modifiedAt: new Date().toISOString() };
  }
  return {
    ...node,
    children: node.children.map((c) => updateFileContent(c, fileId, content)),
  };
}

export { DEMO_FILES };
