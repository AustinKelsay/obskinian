---
title: Obsidian Clone
status: in-progress
tags:
  - project
  - obsidian
created: 2024-06-15
---

# Obsidian Clone

Building a front-end clone of Obsidian as a scaffold for future full implementation.

> [!note] Architecture
> Built with Next.js, TipTap, and Zustand for a modular, AI-first codebase.

## Goals

1. **Pixel-perfect UI** — match Obsidian's dark theme, layout, and interactions
2. **Demo vault** — real files and folders with wiki-link connections
3. **WYSIWYG editor** — what-you-see-is-what-you-get editing
4. **Graph view** — force-directed note visualization

> [!tip] Embed example
> See the transcluded preview below from Graph View.

![[Graph View]]

## Architecture

```
src/
├── components/     # UI components
├── lib/vault/      # Vault logic & types
└── vault/          # Demo markdown files
```

## Related

- [[Welcome]]
- [[Graph View]]
- [[Knowledge Graph Theory]]
- [[Projects/Website Redesign]]

#project #obsidian #development
