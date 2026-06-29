/**
 * Read-only reading view — full markdown render with wiki-links, embeds, and math.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useVaultStore } from "@/lib/vault/vault-store";
import { createEmbedResolvers } from "@/lib/vault/embed-resolvers";
import { renderReadingHtml } from "@/lib/markdown/pipeline";
import { EditorHydrator } from "./EditorHydrator";

interface ReadingViewProps {
  fileId: string;
  content: string;
  /** Full-width layout for split preview pane */
  layout?: "default" | "split";
  /** Optional ref for the scroll container (split preview sync) */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

/** Non-editable rendered markdown view (Obsidian reading mode) */
export function ReadingView({ fileId, content, layout = "default", scrollRef }: ReadingViewProps) {
  const vault = useVaultStore((s) => s.vault);
  const openFileByLink = useVaultStore((s) => s.openFileByLink);
  const scrollToHeadingId = useVaultStore((s) => s.scrollToHeadingId);
  const scrollToBlockId = useVaultStore((s) => s.scrollToBlockId);
  const clearScrollToHeading = useVaultStore((s) => s.clearScrollToHeading);
  const clearScrollToBlock = useVaultStore((s) => s.clearScrollToBlock);

  const containerRef = useRef<HTMLDivElement>(null);
  const [hydrateKey, setHydrateKey] = useState(0);

  const embedOptions = useMemo(() => createEmbedResolvers(vault), [vault]);
  const html = useMemo(
    () => renderReadingHtml(content, embedOptions),
    [content, embedOptions]
  );

  useEffect(() => {
    setHydrateKey((k) => k + 1);
  }, [html, fileId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const embedEl = target.closest(".wiki-embed") as HTMLElement | null;
      if (embedEl) {
        const isHeader = target.closest(".wiki-embed-header");
        if (isHeader) {
          const linkTarget = embedEl.getAttribute("data-target");
          if (linkTarget) {
            openFileByLink(linkTarget, { openInSplit: e.metaKey || e.ctrlKey });
          }
        }
        return;
      }

      const wikiEl = target.closest(".wiki-link") as HTMLElement | null;
      if (wikiEl) {
        const linkTarget = wikiEl.getAttribute("data-target");
        if (linkTarget) {
          openFileByLink(linkTarget, { openInSplit: e.metaKey || e.ctrlKey });
        }
      }
    }

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [openFileByLink, html]);

  useEffect(() => {
    if (!scrollToHeadingId) return;
    containerRef.current?.querySelector(`#${CSS.escape(scrollToHeadingId)}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    clearScrollToHeading();
  }, [scrollToHeadingId, clearScrollToHeading]);

  useEffect(() => {
    if (!scrollToBlockId) return;
    containerRef.current?.querySelector(`#${CSS.escape(scrollToBlockId)}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    clearScrollToBlock();
  }, [scrollToBlockId, clearScrollToBlock]);

  return (
    <div ref={scrollRef} className="relative h-full overflow-y-auto bg-obs-bg">
      <EditorHydrator containerRef={containerRef} hydrateKey={hydrateKey} />
      <div
        ref={containerRef}
        className={cn(
          "tiptap reading-view py-8",
          layout === "split" ? "px-4" : "mx-auto max-w-[720px] px-8"
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
