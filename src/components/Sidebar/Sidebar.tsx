import { AnimatePresence } from 'framer-motion'
import { ArrowRight, FileText, Loader2, RefreshCw, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ApiStatus } from '@/hooks/useNotes'
import type { Note } from '@/types/note'
import { NoteListItem } from './NoteListItem'

const SIDEBAR_PREVIEW_LIMIT = 8

interface SidebarProps {
  notes: Note[]
  fetchStatus: ApiStatus
  fetchError: string | null
  selectedId: string | null
  onSelect: (note: Note) => void
  onNewNote: () => void
  onRefresh: () => void
  onViewAll: () => void
}

export function Sidebar({
  notes,
  fetchStatus,
  fetchError,
  selectedId,
  onSelect,
  onNewNote,
  onRefresh,
  onViewAll,
}: SidebarProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(
      n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q),
    )
  }, [notes, query])

  // In search mode show all matches; otherwise cap at the preview limit
  const visibleNotes = query ? filtered : filtered.slice(0, SIDEBAR_PREVIEW_LIMIT)
  const hiddenCount = query ? 0 : Math.max(0, filtered.length - SIDEBAR_PREVIEW_LIMIT)

  const isLoading = fetchStatus === 'loading'

  return (
    <aside
      className="flex flex-col h-full bg-[var(--color-surface-subtle)] border-r border-[var(--color-border)]"
      aria-label="Notes sidebar"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[var(--color-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">Notes</span>
            {!isLoading && fetchStatus === 'success' && (
              <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                {notes.length}
              </span>
            )}
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            aria-label="Refresh notes"
            title="Refresh notes"
            className="p-1.5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search notes…"
            aria-label="Search notes"
            className="w-full pl-7 pr-7 py-1.5 text-sm bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-md)] placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)] focus-visible:outline-[var(--color-accent)] transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* New Note button */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={onNewNote}
          className="w-full py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors cursor-pointer"
        >
          + New Note
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" role="list">
        {isLoading && !notes.length && (
          <div className="flex items-center justify-center gap-2 py-12 text-[var(--color-text-muted)]">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            <span className="text-sm">Loading…</span>
          </div>
        )}

        {fetchError && (
          <div className="mx-1 p-3 rounded-[var(--radius-md)] bg-[var(--color-danger-subtle)] border border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)]">
            <p className="text-xs text-[var(--color-danger)] font-medium">Could not load notes</p>
            <p className="text-xs text-[var(--color-danger)] opacity-80 mt-0.5">{fetchError}</p>
          </div>
        )}

        {!isLoading && !fetchError && notes.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <FileText size={28} className="text-[var(--color-text-muted)] opacity-40 mb-3" aria-hidden="true" />
            <p className="text-sm text-[var(--color-text-muted)]">No notes yet</p>
            <p className="text-xs text-[var(--color-text-muted)] opacity-70 mt-1">
              Click "New Note" to get started
            </p>
          </div>
        )}

        {query && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <Search size={22} className="text-[var(--color-text-muted)] opacity-40 mb-3" aria-hidden="true" />
            <p className="text-sm text-[var(--color-text-muted)]">No results for "{query}"</p>
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[var(--color-accent)] mt-2 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        )}

        <AnimatePresence initial={false}>
          {visibleNotes.map(note => (
            <div key={note.id} role="listitem">
              <NoteListItem
                note={note}
                isSelected={note.id === selectedId}
                onClick={() => onSelect(note)}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* View all notes footer — only shown when there are hidden notes */}
      {hiddenCount > 0 && (
        <div className="px-3 py-2.5 border-t border-[var(--color-border-subtle)] shrink-0">
          <button
            onClick={onViewAll}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-[var(--radius-md)] text-[var(--color-accent)] bg-[var(--color-accent-subtle)] hover:bg-[var(--color-accent-muted)] transition-colors cursor-pointer"
          >
            <span>View all notes</span>
            <span className="flex items-center gap-1">
              <span className="text-[var(--color-text-muted)]">+{hiddenCount} more</span>
              <ArrowRight size={12} />
            </span>
          </button>
        </div>
      )}
    </aside>
  )
}
