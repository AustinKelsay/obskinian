/**
 * Resizable panel wrapper with drag handle.
 * Allows horizontal resizing of sidebars like Obsidian.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side: "left" | "right";
  className?: string;
  /** Persists width in localStorage when set */
  storageKey?: string;
}

/** Reads stored sidebar width from localStorage */
function readStoredWidth(storageKey: string | undefined, fallback: number): number {
  if (typeof window === "undefined" || !storageKey) return fallback;
  const stored = localStorage.getItem(storageKey);
  if (!stored) return fallback;
  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** Horizontally resizable sidebar panel */
export function ResizablePanel({
  children,
  defaultWidth = 260,
  minWidth = 180,
  maxWidth = 480,
  side,
  className,
  storageKey,
}: ResizablePanelProps) {
  const widthRef = useRef(defaultWidth);
  const [width, setWidth] = useState(() => readStoredWidth(storageKey, defaultWidth));
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(defaultWidth);

  const persistWidth = useCallback(
    (value: number) => {
      if (!storageKey || typeof window === "undefined") return;
      localStorage.setItem(storageKey, String(Math.round(value)));
    },
    [storageKey]
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      startX.current = e.clientX;
      startWidth.current = width;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [width]
  );

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = side === "left" ? e.clientX - startX.current : startX.current - e.clientX;
      const next = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
      widthRef.current = next;
      setWidth(next);
    },
    [side, minWidth, maxWidth]
  );

  const onMouseUp = useCallback(() => {
    if (!dragging.current) return;
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
    persistWidth(widthRef.current);
  }, [persistWidth]);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div className={cn("relative flex shrink-0 flex-col", className)} style={{ width }}>
      {children}
      <div
        className={cn(
          "absolute top-0 z-10 h-full w-1 cursor-col-resize bg-obs-border/60 transition-colors hover:bg-obs-accent/50",
          side === "left" ? "-right-0.5" : "-left-0.5"
        )}
        onMouseDown={onMouseDown}
      />
    </div>
  );
}
