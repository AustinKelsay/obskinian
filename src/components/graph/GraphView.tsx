/**
 * Force-directed graph visualization with display mode filters.
 */

"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Search, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { readObsidianCssColors } from "@/lib/css-vars";
import { iconBtnClass, panelTitleClass, searchFieldClass } from "@/lib/ui-classes";
import { computeGraphData, resolveActiveFile } from "@/lib/vault/compute-graph-data";
import type { GraphDisplayFilter } from "@/lib/vault/graph-utils";
import { useVaultStore } from "@/lib/vault/vault-store";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-[13px] text-obs-text-faint">
      Loading graph…
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
  const vault = useVaultStore((s) => s.vault);
  const tabs = useVaultStore((s) => s.tabs);
  const activeTabId = useVaultStore((s) => s.activeTabId);
  const graphFilter = useVaultStore((s) => s.graphFilter);
  const graphDisplayFilter = useVaultStore((s) => s.graphDisplayFilter);
  const setGraphFilter = useVaultStore((s) => s.setGraphFilter);
  const setGraphDisplayFilter = useVaultStore((s) => s.setGraphDisplayFilter);
  const openFile = useVaultStore((s) => s.openFile);

  const graphData = useMemo(
    () =>
      computeGraphData({
        vault,
        tabs,
        activeTabId,
        graphDisplayFilter,
        graphFilter,
      }),
    [vault, tabs, activeTabId, graphDisplayFilter, graphFilter]
  );

  const activeFile = useMemo(
    () => resolveActiveFile(vault, tabs, activeTabId),
    [vault, tabs, activeTabId]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [colors, setColors] = useState(readObsidianCssColors);

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

  useEffect(() => {
    setColors(readObsidianCssColors());
    const root = document.documentElement;
    const observer = new MutationObserver(() => setColors(readObsidianCssColors()));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme", "style"] });
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

  const linkColors = useMemo(
    () => ({
      wiki: hexToRgba(colors.accent, 0.45),
      embed: hexToRgba(colors.accent, 0.22),
    }),
    [colors.accent]
  );

  return (
    <div className="flex h-full flex-col bg-obs-bg">
      <div className="flex h-[36px] shrink-0 items-center justify-between border-b border-obs-border px-3">
        <div className="flex items-center gap-2">
          <span className={panelTitleClass}>Graph view</span>
          <div className="flex items-center gap-0.5">
            {DISPLAY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setGraphDisplayFilter(f.id)}
                className={cn(
                  "rounded-sm px-2 py-0.5 text-[11px] transition-colors",
                  graphDisplayFilter === f.id
                    ? "bg-obs-interactive-hover text-obs-text"
                    : "text-obs-text-faint hover:bg-obs-interactive-hover hover:text-obs-text-muted"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button type="button" title="Zoom in" aria-label="Zoom in" onClick={handleZoomIn} className={iconBtnClass}>
            <ZoomIn size={14} />
          </button>
          <button type="button" title="Zoom out" aria-label="Zoom out" onClick={handleZoomOut} className={iconBtnClass}>
            <ZoomOut size={14} />
          </button>
          <button type="button" title="Fit to view" aria-label="Fit to view" onClick={handleFit} className={iconBtnClass}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      <div className={searchFieldClass}>
        <Search size={14} className="shrink-0 text-obs-text-faint" />
        <input
          type="text"
          placeholder="Filter nodes…"
          value={graphFilter}
          onChange={(e) => setGraphFilter(e.target.value)}
          className="w-full bg-transparent text-[13px] text-obs-text outline-none placeholder:text-obs-text-faint"
        />
      </div>

      <div ref={containerRef} className="graph-container relative flex-1">
        {graphData.nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[13px] text-obs-text-faint">
            No nodes match the current filter.
          </div>
        ) : (
          <ForceGraph2D
            ref={graphRef}
            graphData={graphData}
            width={dimensions.width}
            height={dimensions.height}
            backgroundColor={colors.bg}
            nodeLabel="name"
            nodeColor={(node) => {
              if (activeFile && node.id === activeFile.id) return colors.accent;
              return colors.textFaint;
            }}
            nodeRelSize={6}
            linkColor={(link) =>
              (link as { kind?: string }).kind === "embed" ? linkColors.embed : linkColors.wiki
            }
            linkWidth={(link) => ((link as { kind?: string }).kind === "embed" ? 1 : 1.5)}
            linkLineDash={(link) =>
              (link as { kind?: string }).kind === "embed" ? [4, 3] : null
            }
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = (node.name as string) ?? "";
              const fontSize = 12 / globalScale;
              const isActive = activeFile && node.id === activeFile.id;
              const nodeRadius = Math.sqrt((node.val as number) ?? 1) * 4;

              ctx.beginPath();
              ctx.arc(node.x!, node.y!, nodeRadius, 0, 2 * Math.PI);
              ctx.fillStyle = isActive ? colors.accent : colors.textFaint;
              ctx.fill();
              if (isActive) {
                ctx.strokeStyle = colors.accentHover;
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }

              if (globalScale > 0.5) {
                ctx.font = `${fontSize}px var(--font-obs), Inter, sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillStyle = isActive ? colors.text : colors.textMuted;
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
    </div>
  );
}

/** Converts #rrggbb to rgba string for canvas link colors */
function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(127, 109, 242, ${alpha})`;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
