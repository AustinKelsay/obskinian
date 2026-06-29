/**
 * Force-directed graph visualization with display mode filters.
 */

"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Search, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GraphDisplayFilter } from "@/lib/vault/graph-utils";
import { useVaultStore } from "@/lib/vault/vault-store";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-obs-text-muted">
      Loading graph...
    </div>
  ),
});

const DISPLAY_FILTERS: { id: GraphDisplayFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "local", label: "Local" },
  { id: "orphans", label: "Orphans" },
];

/** Interactive graph view panel matching Obsidian's graph */
export function GraphView() {
  const graphData = useVaultStore((s) => s.getGraphData());
  const graphFilter = useVaultStore((s) => s.graphFilter);
  const graphDisplayFilter = useVaultStore((s) => s.graphDisplayFilter);
  const setGraphFilter = useVaultStore((s) => s.setGraphFilter);
  const setGraphDisplayFilter = useVaultStore((s) => s.setGraphDisplayFilter);
  const openFile = useVaultStore((s) => s.openFile);
  const activeFile = useVaultStore((s) => s.getActiveFile());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const handleNodeClick = useCallback(
    (node: { id?: string | number }) => {
      if (node.id) openFile(String(node.id));
    },
    [openFile]
  );

  const handleZoomIn = () => graphRef.current?.zoom(1.5, 400);
  const handleZoomOut = () => graphRef.current?.zoom(0.67, 400);
  const handleFit = () => graphRef.current?.zoomToFit(400, 60);

  const bgColor =
    typeof document !== "undefined"
      ? getComputedStyle(document.documentElement).getPropertyValue("--color-obs-bg").trim() ||
        "#1e1e1e"
      : "#1e1e1e";

  return (
    <div className="flex h-full flex-col bg-obs-bg">
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-obs-border px-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-obs-text-muted">
          Graph view
        </span>
        <div className="flex items-center gap-1">
          <button type="button" title="Zoom in" aria-label="Zoom in" onClick={handleZoomIn} className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text">
            <ZoomIn size={14} />
          </button>
          <button type="button" title="Zoom out" aria-label="Zoom out" onClick={handleZoomOut} className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text">
            <ZoomOut size={14} />
          </button>
          <button type="button" title="Fit to view" aria-label="Fit to view" onClick={handleFit} className="flex h-6 w-6 items-center justify-center rounded text-obs-text-muted hover:bg-obs-interactive-hover hover:text-obs-text">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-obs-border px-2 py-1.5">
        {DISPLAY_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setGraphDisplayFilter(f.id)}
            className={cn(
              "rounded px-2.5 py-1 text-[11px] transition-colors",
              graphDisplayFilter === f.id
                ? "bg-obs-accent/20 text-obs-accent"
                : "text-obs-text-muted hover:bg-obs-interactive-hover"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border-b border-obs-border p-2">
        <div className="flex items-center gap-2 rounded-md bg-obs-interactive px-2 py-1.5">
          <Search size={14} className="shrink-0 text-obs-text-faint" />
          <input
            type="text"
            placeholder="Filter nodes..."
            value={graphFilter}
            onChange={(e) => setGraphFilter(e.target.value)}
            className="w-full bg-transparent text-[13px] text-obs-text outline-none placeholder:text-obs-text-faint"
          />
        </div>
      </div>

      <div ref={containerRef} className="graph-container relative flex-1">
        {graphData.nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[13px] text-obs-text-faint">
            No nodes match the current filter
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor={bgColor}
            nodeLabel="name"
            nodeColor={(node) => {
              if (activeFile && node.id === activeFile.id) return "#7f6df2";
              return "#666666";
            }}
            nodeRelSize={6}
            linkColor={() => "rgba(127, 109, 242, 0.3)"}
            linkWidth={1}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = (node.name as string) ?? "";
              const fontSize = 12 / globalScale;
              const isActive = activeFile && node.id === activeFile.id;
              const nodeRadius = Math.sqrt((node.val as number) ?? 1) * 4;

              ctx.beginPath();
              ctx.arc(node.x!, node.y!, nodeRadius, 0, 2 * Math.PI);
              ctx.fillStyle = isActive ? "#7f6df2" : "#555555";
              ctx.fill();
              if (isActive) {
                ctx.strokeStyle = "#927aff";
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }

              if (globalScale > 0.5) {
                ctx.font = `${fontSize}px Inter, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = isActive ? "#dcddde" : "#999999";
                ctx.fillText(label, node.x!, node.y! + nodeRadius + 2);
              }
            }}
            onNodeClick={handleNodeClick}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        )}
      </div>

      <div className="flex h-[26px] shrink-0 items-center justify-between border-t border-obs-border px-3 text-[11px] text-obs-text-muted">
        <span>{graphData.nodes.length} nodes</span>
        <span>{graphData.links.length} connections</span>
      </div>
    </div>
  );
}
