/**
 * Search panel for finding notes by name or content.
 * Displays matching snippets with click-to-open navigation.
 */

"use client";

import { Search } from "lucide-react";
import { useVaultStore } from "@/lib/vault/vault-store";

/** Left sidebar search panel */
export function SearchPanel() {
  const { searchQuery, searchResults, setSearchQuery, openFile } = useVaultStore();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[36px] shrink-0 items-center border-b border-obs-border px-3">
        <span className="text-[11px] font-medium uppercase tracking-wider text-obs-text-muted">
          Search
        </span>
      </div>
      <div className="border-b border-obs-border p-2">
        <div className="flex items-center gap-2 rounded-md bg-obs-interactive px-2 py-1.5">
          <Search size={14} className="shrink-0 text-obs-text-faint" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-[13px] text-obs-text outline-none placeholder:text-obs-text-faint"
            autoFocus
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {searchQuery && searchResults.length === 0 && (
          <p className="px-3 py-4 text-[13px] text-obs-text-faint">No results found.</p>
        )}
        {searchResults.map((result) => (
          <button
            key={result.fileId}
            type="button"
            className="flex w-full flex-col gap-0.5 border-b border-obs-border/50 px-3 py-2 text-left transition-colors hover:bg-obs-interactive-hover"
            onClick={() => openFile(result.fileId)}
          >
            <span className="text-[13px] font-medium text-obs-text">{result.fileName}</span>
            <span className="truncate text-[12px] text-obs-text-faint">{result.snippet}</span>
          </button>
        ))}
        {!searchQuery && (
          <p className="px-3 py-4 text-[13px] text-obs-text-faint">
            Type to search across all notes...
          </p>
        )}
      </div>
    </div>
  );
}
