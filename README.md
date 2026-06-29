# Obskinian

A **skin-deep front-end clone** of [Obsidian](https://obsidian.md) — built as boilerplate and scaffolding for a full clone.

## Features

### UI (Obsidian-accurate dark theme)
- Left **ribbon** with File Explorer, Search, and Graph View icons
- **Collapsible, resizable** left and right sidebars
- **Tab bar** for open notes with close buttons
- **Status bar** with word/character counts and vault info
- **Command palette** (`⌘P` / `Ctrl+P`) for quick navigation and actions

### Demo vault (`vault/`)
- Real markdown files on disk with folder structure
- Wiki-links (`[[like this]]`) connect notes across the vault
- Filesystem sync via `/api/vault` API routes

### Core features
- **File explorer** — collapsible folder tree, create/delete notes
- **WYSIWYG editor** — TipTap with live preview and formatting toolbar
- **Source mode** — raw markdown editing (`⌘E` / `Ctrl+E` to toggle)
- **Split panes** — vertical or horizontal editor splits
- **Graph view** — force-directed visualization of wiki-link connections
- **Search** — find notes by name or content
- **Right sidebar** — outline, backlinks, and tags panels
- **Plugin scaffold** — extensible hook-based plugin registry

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘P` / `Ctrl+P` | Command palette |
| `⌘E` / `Ctrl+E` | Toggle live / source mode |
| `⌘N` / `Ctrl+N` | Create new note |
| `⌘W` / `Ctrl+W` | Close active tab |
| `⌘G` / `Ctrl+G` | Open graph view |
| `⌘⇧F` / `Ctrl+Shift+F` | Open search |
| `⌘D` / `Ctrl+D` | Open today's daily note (via command palette) |

### Phase 5
- **Tab drag-and-drop** — reorder open tabs (pinned/unpinned groups)
- **Context menus** — right-click files/folders in explorer
- **Note templates** — create notes from Templates/ with placeholder substitution
- **Graph filters** — All, Local (1-hop), Orphans display modes
- **Mobile layout** — sidebars as overlays on narrow viewports
- **Light/dark themes** with 5 accent color options (Settings → Appearance)
- **Inline rename** — double-click or pencil icon on files/folders
- **Drag-and-drop** — drag notes onto folders to move them
- **Outline navigation** — click headings in right sidebar to scroll
- **Plugin commands** — registered plugin commands appear in palette
- **Settings panel** — daily notes, recent files, plugin list
- **Fuzzy command palette** — smarter search with grouped results
- **Recent files** — shown in command palette when empty
- **Folder create/collapse** — wired in file explorer
- **Tab pinning** — pin icon on tabs
- **Clickable tags** — click to search by tag

### Phase 6
- **Path fuzzy search** — command palette matches file paths (e.g. `Daily/` finds daily notes)
- **Backlink preview** — hover backlinks in right sidebar for context tooltip
- **Slash commands** — type `/` in editor for headings, lists, todos, quotes, etc.
- **Workspace persistence** — saves/restores tabs and sidebar layout between sessions
- **Custom CSS snippets** — inject personal CSS from Settings
- **Export as HTML** — download active note as styled HTML (toolbar or command palette)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Welcome.md opens automatically.

## Project Structure

```
vault/                  # Physical demo markdown files (read/written by API)
src/
├── app/api/vault/      # Filesystem CRUD API
├── components/
│   ├── command/      # Command palette
│   ├── editor/       # WYSIWYG, source, split panes
│   ├── explorer/     # File tree
│   ├── graph/        # Graph visualization
│   ├── layout/       # Shell, ribbon, tabs, sidebars
│   ├── plugins/      # Plugin manager UI
│   └── search/       # Search panel
├── hooks/              # Keyboard shortcuts
└── lib/
    ├── plugins/        # Plugin registry
    └── vault/          # Types, FS, store, link parsing
```

## Tech Stack

- **Next.js 15** — React framework with API routes
- **TipTap** — WYSIWYG editor
- **react-force-graph-2d** — Graph visualization
- **Zustand** — State management
- **Tailwind CSS 4** — Styling
- **Lucide React** — Icons

## License

MIT
