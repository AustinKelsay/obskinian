# Graph View

The **Graph View** visualizes connections between your notes. Each node represents a note. Solid edges are `[[wiki-links]]`; dashed edges are `![[embeds]]`.

## How It Works

When you create a link like `[[Knowledge Graph Theory]]`, Obsidian draws a connection between the two notes in the graph. Embedding a note with `![[Welcome]]` creates a dashed embed edge.

## Graph Controls

- **Zoom**: Scroll wheel
- **Pan**: Click and drag background
- **Focus**: Click a node to open that note
- **Filter**: Use the search box to highlight specific notes

```mermaid
graph LR
  Welcome --> Graph View
  Welcome -->|"embed"| Obsidian Clone
  Graph View --> Knowledge Graph Theory
```

## Related Notes

- [[Welcome]]
- [[Knowledge Graph Theory]]
- [[Projects/Obsidian Clone]]
- [[MOC - Knowledge Management]]

#graph #visualization #connections
