/**
 * Client-side hydration for Mermaid diagrams and syntax-highlighted code blocks.
 */

"use client";

import { useEffect } from "react";

interface EditorHydratorProps {
  containerRef: React.RefObject<HTMLElement | null>;
  hydrateKey: number;
}

/** Resolves default export from dynamic ESM/CJS interop bundles */
function resolveDefault(mod: unknown): Record<string, unknown> {
  if (mod && typeof mod === "object" && "default" in mod && mod.default) {
    return mod.default as Record<string, unknown>;
  }
  return mod as Record<string, unknown>;
}

/** Renders Mermaid diagrams and highlights code blocks inside the editor */
export function EditorHydrator({ containerRef, hydrateKey }: EditorHydratorProps) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    async function hydrateMermaid() {
      const nodes = container!.querySelectorAll<HTMLElement>(
        ".mermaid-diagram:not([data-rendered])"
      );
      if (nodes.length === 0) return;

      const mermaid = resolveDefault(await import("mermaid"));
      if (typeof mermaid.initialize !== "function" || typeof mermaid.render !== "function") return;

      (mermaid.initialize as (config: object) => void)({
        theme: "dark",
        startOnLoad: false,
        securityLevel: "strict",
      });

      for (const node of nodes) {
        const source = node.textContent?.trim() ?? "";
        if (!source) continue;
        try {
          const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
          const { svg } = await (mermaid.render as (id: string, src: string) => Promise<{ svg: string }>)(
            id,
            source
          );
          node.innerHTML = svg;
          node.setAttribute("data-rendered", "true");
        } catch {
          node.innerHTML = `<pre class="mermaid-error">${source}</pre>`;
          node.setAttribute("data-rendered", "true");
        }
      }
    }

    async function hydrateCode() {
      const hljs = resolveDefault(await import("highlight.js/lib/common"));
      if (typeof hljs.highlightElement !== "function") return;

      container!.querySelectorAll("pre code[data-lang]").forEach((block) => {
        (hljs.highlightElement as (el: HTMLElement) => void)(block as HTMLElement);
      });
    }

    hydrateMermaid();
    hydrateCode();
  }, [containerRef, hydrateKey]);

  return null;
}
