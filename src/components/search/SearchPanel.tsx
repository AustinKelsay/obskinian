/**
 * Search panel for finding notes by name or content.
 * Displays matching snippets with click-to-open navigation.
 */

"use client";

import { Search } from "lucide-react";
import { panelEmptyClass, panelHeaderClass, panelTitleClass, searchFieldClass } from "@/lib/ui-classes";
import { useVaultStore } from "@/lib/vault/vault-store";

/** Left sidebar search panel */
export function SearchPanel() {
  const { searchQuery, searchResults, setSearchQuery, openFile } = useVaultStore();

  return (
    <div className="flex h-full flex-col">
      <div className={panelHeaderClass}>
        <span className={panelTitleClass}>Search</span>
      </div>
      <div className={searchFieldClass}>
        <Search size={14} className="shrink-0 text-obs-text-faint" />
        <input
          type="text"
          placeholder="Search notes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-[13px] text-obs-text outline-none placeholder:text-obs-text-faint"
          autoFocus
        />
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {searchQuery && searchResults.length === 0 && (
          <p className={panelEmptyClass}>No results found.</p>
        )}
        {searchResults.map((result) => (
          <button
            key={result.fileId}
            type="button"
            className="flex w-full flex-col gap-0.5 px-3 py-2 text-left transition-colors hover:bg-obs-interactive-hover"
            onClick={() => openFile(result.fileId)}
          >
            <span className="text-[13px] font-medium text-obs-text">{result.fileName}</span>
            <span className="truncate text-[12px] text-obs-text-faint">{result.snippet}</span>
          </button>
        ))}
        {!searchQuery && (
          <p className={panelEmptyClass}>Type to search across all notes.</p>
        )}
      </div>
    </div>
  );
}
