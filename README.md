# Obskinian

A **skin-deep front-end clone** of [Obsidian](https://obsidian.md) — built as boilerplate and scaffolding for a full clone.

## Features

- **Obsidian-accurate UI** — dark theme, ribbon, sidebars, tabs, status bar
- **Demo vault** — real markdown files in `vault/` with folder structure
- **File explorer** — collapsible folder tree with note navigation
- **WYSIWYG editor** — TipTap-powered rich text editing
- **Graph view** — force-directed visualization of wiki-link connections
- **Search** — find notes by name or content
- **Right sidebar** — outline, backlinks, and tags panels
- **Wiki-links** — click `[[links]]` to navigate between notes

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
vault/                  # Demo markdown files (physical files)
src/
├── app/                # Next.js app router
├── components/
│   ├── layout/         # Shell, ribbon, tabs, sidebars
│   ├── explorer/       # File tree
│   ├── editor/         # WYSIWYG editor
│   ├── graph/          # Graph visualization
│   └── search/         # Search panel
└── lib/
    └── vault/          # Types, data, store, link parsing
```

## Tech Stack

- **Next.js 15** — React framework
- **TipTap** — WYSIWYG editor
- **react-force-graph-2d** — Graph visualization
- **Zustand** — State management
- **Tailwind CSS 4** — Styling
- **Lucide React** — Icons

## License

MIT
