/**
 * Draggable horizontal split ratio for editor panes.
 * Persists ratio in sessionStorage when a storageKey is provided.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_RATIO = 0.5;
const MIN_RATIO = 0.2;
const MAX_RATIO = 0.8;

interface UseHorizontalSplitOptions {
  /** Optional key for sessionStorage persistence */
  storageKey?: string;
  initialRatio?: number;
}

interface UseHorizontalSplitResult {
  ratio: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  startDrag: (event: React.PointerEvent<HTMLElement>) => void;
}

/** Manages a resizable left/right split ratio with pointer drag */
export function useHorizontalSplit({
  storageKey,
  initialRatio = DEFAULT_RATIO,
}: UseHorizontalSplitOptions = {}): UseHorizontalSplitResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(() => {
    if (typeof window === "undefined" || !storageKey) return initialRatio;
    const stored = sessionStorage.getItem(storageKey);
    if (!stored) return initialRatio;
    const parsed = Number.parseFloat(stored);
    return Number.isFinite(parsed) ? clampRatio(parsed) : initialRatio;
  });
  const [isDragging, setIsDragging] = useState(false);

  const persistRatio = useCallback(
    (value: number) => {
      if (!storageKey || typeof window === "undefined") return;
      sessionStorage.setItem(storageKey, String(value));
    },
    [storageKey]
  );

  const updateRatioFromPointer = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const next = clampRatio((clientX - rect.left) / rect.width);
    setRatio(next);
    persistRatio(next);
  }, [persistRatio]);

  const startDrag = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(true);
      updateRatioFromPointer(event.clientX);
    },
    [updateRatioFromPointer]
  );

  useEffect(() => {
    if (!isDragging) return;

    function handlePointerMove(event: PointerEvent) {
      updateRatioFromPointer(event.clientX);
    }

    function handlePointerUp() {
      setIsDragging(false);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, updateRatioFromPointer]);

  return { ratio, containerRef, isDragging, startDrag };
}

/** Clamps split ratio within usable bounds */
function clampRatio(value: number): number {
  return Math.min(MAX_RATIO, Math.max(MIN_RATIO, value));
}
