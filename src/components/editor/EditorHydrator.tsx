/**
 * Client-side hydration for Mermaid diagrams and syntax-highlighted code blocks.
 */

"use client";

import { useEffect } from "react";

interface EditorHydratorProps {
  containerRef: React.RefObject<HTMLElement | null>;
  hydrateKey: number;
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

      const mermaid = (await import("mermaid")).default;
      mermaid.initialize({
        theme: "dark",
        startOnLoad: false,
        securityLevel: "strict",
      });

      for (const node of nodes) {
        const source = node.textContent?.trim() ?? "";
        if (!source) continue;
        try {
          const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
          const { svg } = await mermaid.render(id, source);
          node.innerHTML = svg;
          node.setAttribute("data-rendered", "true");
        } catch {
          node.innerHTML = `<pre class="mermaid-error">${source}</pre>`;
          node.setAttribute("data-rendered", "true");
        }
      }
    }

    async function hydrateCode() {
      const hljs = (await import("highlight.js/lib/common")).default;
      container!.querySelectorAll("pre code[data-lang]").forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
      });
    }

    hydrateMermaid();
    hydrateCode();
  }, [containerRef, hydrateKey]);

  return null;
}
