# Knowledge Graph Theory

A **knowledge graph** connects ideas through relationships rather than rigid hierarchies.

## Core Concepts

### Nodes
Each note is a node — an atomic unit of knowledge.

### Edges
Wiki-links create edges between nodes:
- `[[Welcome]]` links to the Welcome note
- Bidirectional connections emerge naturally

### Clusters
Related notes form **clusters** — visible in [[Graph View]] as tightly connected groups.

## Zettelkasten Method

1. **Fleeting notes** — quick captures
2. **Literature notes** — from sources
3. **Permanent notes** — refined ideas
4. **Structure notes** — maps of content (MOCs)

See also: [[MOC - Knowledge Management]]

## Graph Metrics

| Metric | Formula | Meaning |
| --- | --- | --- |
| Degree | $k_i$ | Links per note |
| Clustering | $C = \frac{2E}{k(k-1)}$ | Local density |
| Path length | $d(i,j)$ | Steps between notes |

The small-world property suggests $d(i,j) \propto \log N$ for large vaults.

#theory #zettelkasten #knowledge-management
