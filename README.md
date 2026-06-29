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
| `⌘E` / `Ctrl+E` | Cycle live / source / split / reading mode |
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

### Phase 7
- **YAML frontmatter** — properties panel for note metadata (title, tags, status, etc.)
- **Obsidian callouts** — `> [!note]`, `> [!tip]`, `> [!warning]` styled blocks
- **Note embeds** — `![[Note Name]]` transclusion with live preview
- **Linked vs unlinked mentions** — backlinks panel splits wiki-links from plain-text references
- **Heading links** — `[[Note#Heading]]` navigates and scrolls to the target heading

### Phase 8
- **Block references** — `^block-id` anchors and `[[Note#^block-id]]` navigation
- **Embed graph edges** — dashed lines in graph view for transclusion links
- **Image embeds** — `![[attachments/image.png]]` rendered from vault assets
- **Wiki-link fragments** — heading and block subpaths preserved on click in live preview
- **Slash commands** — `/callout`, `/embed`, `/blockid` for quick insertion
- **Alias round-trip** — `[[target|alias]]` preserved through WYSIWYG editing

### Phase 9
- **Full transclusion** — `![[Note]]` renders the complete embedded note body inline
- **Wiki-link hover preview** — tooltip with note preview on hover in live editor
- **Cmd/Ctrl+click** — open wiki-links and embeds in a split pane
- **Mermaid diagrams** — ` ```mermaid ` code blocks render as SVG diagrams
- **Syntax highlighting** — fenced code blocks highlighted via highlight.js
- **Promote unlinked mentions** — convert plain-text mentions to `[[wiki-links]]` from backlinks panel

### Phase 10
- **Reading mode** — read-only rendered view with full Obsidian syntax support
- **Unified markdown pipeline** — remark/rehype with GFM tables and LaTeX math (KaTeX)
- **Editor mode cycle** — `⌘E` / toolbar cycles Live → Source → Reading
- **TipTap headings H4–H6** — extended heading support in live editor

### Phase 11
- **Split preview** — side-by-side source editor + reading preview with draggable divider
- **Scroll sync** — source scroll position maps to the reading preview in split mode
- **Line numbers** — gutter in source and split modes for easier navigation
- **Export pipeline** — HTML export uses the same remark/KaTeX renderer as reading mode

### UI polish
- **Obsidian-accurate chrome** — flat ribbon with left accent bar, icon-rail right sidebar, resizable panels
- **Unified panel typography** — consistent headers, empty states, and list row hover across all panels
- **Theme-aware graph** — node/link colors follow accent and theme CSS variables
- **Tab bar fidelity** — active tab connects to editor surface; pinned tabs show persistent pin icon
- **Responsive modals** — command palette and template picker adapt to narrow viewports

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — Welcome.md opens automatically.

## Smoke test deploy

### Option A — Render (free public URL, ~5 min)

1. Push this repo to GitHub (already on `main`).
2. Open **[Deploy to Render](https://render.com/deploy?repo=https://github.com/AustinKelsay/obskinian)** (or Dashboard → New → Blueprint → select repo).
3. Confirm the `obskinian` web service from `render.yaml` and click **Apply**.
4. Wait for the build (~3–5 min). Render gives you a URL like `https://obskinian.onrender.com`.

> **Note:** Free tier sleeps after ~15 min idle; first load after sleep takes ~30s. Vault edits persist until the instance restarts or redeploys — fine for smoke testing.

### Option B — Docker (local browser)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

### Option C — Vercel (fastest, read-mostly demo)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AustinKelsay/obskinian)

Import the repo and deploy with defaults. Browsing, search, graph, and reading all work. **File writes may not persist** on Vercel’s read-only serverless filesystem — use Render or Docker for full vault editing.

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
