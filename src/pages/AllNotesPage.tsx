import { motion } from 'framer-motion'
import { ArrowLeft, FileText, Loader2, Plus, Search, Trash2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import type { ApiStatus } from '@/hooks/useNotes'
import { cx, formatDate, truncate } from '@/lib/utils'
import type { Note } from '@/types/note'

interface AllNotesPageProps {
  notes: Note[]
  fetchStatus: ApiStatus
  fetchError: string | null
  selectedId: number | null
  onBack: () => void
  onSelect: (note: Note) => void
  onNewNote: () => void
  onDeleteNote: (note: Note) => void
  onDeleteAll: () => Promise<boolean>
}

// Card for a single note in the grid
function NoteCard({
  note,
  isSelected,
  onClick,
  onDelete,
}: {
  note: Note
  isSelected: boolean
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
}) {
  const date = formatDate(note.updatedAt ?? note.createdAt)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className={cx(
        'group relative flex flex-col gap-2 p-4 rounded-[var(--radius-lg)] border cursor-pointer transition-all',
        isSelected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] shadow-[var(--shadow-sm)]'
          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[color:color-mix(in_srgb,var(--color-accent)_40%,var(--color-border))] hover:shadow-[var(--shadow-sm)]',
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Open note: ${note.title || 'Untitled'}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
    >
      {/* Delete button — appears on hover */}
      <button
        onClick={onDelete}
        aria-label={`Delete "${note.title || 'Untitled'}"`}
        className="absolute top-3 right-3 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-all cursor-pointer"
      >
        <Trash2 size={13} aria-hidden="true" />
      </button>

      {/* Title */}
      <p className={cx(
        'text-sm font-semibold leading-snug pr-6',
        isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]',
      )}>
        {note.title || <span className="italic font-normal text-[var(--color-text-muted)]">Untitled</span>}
      </p>

      {/* Content preview */}
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed flex-1">
        {note.content
          ? truncate(note.content, 120)
          : <span className="italic text-[var(--color-text-muted)]">No content</span>}
      </p>

      {/* Date */}
      {date && (
        <p className="text-[11px] text-[var(--color-text-muted)] mt-auto pt-1 border-t border-[var(--color-border-subtle)]">
          {date}
        </p>
      )}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AllNotesPage({
  notes,
  fetchStatus,
  fetchError,
  selectedId,
  onBack,
  onSelect,
  onNewNote,
  onDeleteNote,
  onDeleteAll,
}: AllNotesPageProps) {
  const [query, setQuery] = useState('')
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)
  const [isDeletingAll, setIsDeletingAll] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(
      n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q),
    )
  }, [notes, query])

  const isLoading = fetchStatus === 'loading'

  async function handleDeleteAllConfirm() {
    setConfirmDeleteAll(false)
    setIsDeletingAll(true)
    await onDeleteAll()
    setIsDeletingAll(false)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-surface-subtle)]">
      {/* ------------------------------------------------------------------ */}
      {/* Header bar                                                           */}
      {/* ------------------------------------------------------------------ */}
      <div className="shrink-0 bg-[var(--color-surface)] border-b border-[var(--color-border)] px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {/* Back */}
          <button
            onClick={onBack}
            aria-label="Back to workspace"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="w-px h-4 bg-[var(--color-border)] shrink-0" aria-hidden="true" />

          {/* Title + count */}
          <div className="flex items-center gap-2 shrink-0">
            <FileText size={15} className="text-[var(--color-text-muted)]" aria-hidden="true" />
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">All Notes</span>
            {!isLoading && (
              <span className="text-xs text-[var(--color-text-muted)] tabular-nums">
                {filtered.length}{query ? ` of ${notes.length}` : ''}
              </span>
            )}
          </div>

          {/* Search — takes remaining space */}
          <div className="relative flex-1 min-w-0">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search all notes…"
              aria-label="Search all notes"
              className="w-full pl-7 pr-7 py-1.5 text-sm bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-[var(--radius-md)] placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)] focus-visible:outline-[var(--color-accent)] transition-colors"
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

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onNewNote}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors cursor-pointer"
            >
              <Plus size={13} aria-hidden="true" />
              <span className="hidden sm:inline">New Note</span>
            </button>

            {notes.length > 0 && (
              <button
                onClick={() => setConfirmDeleteAll(true)}
                disabled={isDeletingAll}
                aria-label="Delete all notes"
                title="Delete all notes"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isDeletingAll
                  ? <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                  : <Trash2 size={13} aria-hidden="true" />
                }
                <span className="hidden sm:inline">
                  {isDeletingAll ? 'Deleting…' : 'Delete All'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Body                                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

          {/* Loading skeleton */}
          {isLoading && notes.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-24 text-[var(--color-text-muted)]">
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              <span className="text-sm">Loading notes…</span>
            </div>
          )}

          {/* Fetch error */}
          {fetchError && (
            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-danger-subtle)] border border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)]">
              <p className="text-sm text-[var(--color-danger)] font-medium">Could not load notes</p>
              <p className="text-xs text-[var(--color-danger)] opacity-80 mt-1">{fetchError}</p>
            </div>
          )}

          {/* Empty — no notes at all */}
          {!isLoading && !fetchError && notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 rounded-full bg-[var(--color-surface-muted)] mb-4">
                <FileText size={28} className="text-[var(--color-text-muted)] opacity-40" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">No notes yet</p>
              <p className="text-xs text-[var(--color-text-muted)] mb-5">Create your first note to get started.</p>
              <button
                onClick={onNewNote}
                className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors cursor-pointer"
              >
                + New Note
              </button>
            </div>
          )}

          {/* Empty search result */}
          {!isLoading && query && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Search size={26} className="text-[var(--color-text-muted)] opacity-40 mb-4" aria-hidden="true" />
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">No results for "{query}"</p>
              <button
                onClick={() => setQuery('')}
                className="text-xs text-[var(--color-accent)] mt-2 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Notes grid */}
          {filtered.length > 0 && (
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
              role="list"
              aria-label="All notes"
            >
              {filtered.map(note => (
                <div key={note.id} role="listitem">
                  <NoteCard
                    note={note}
                    isSelected={note.id === selectedId}
                    onClick={() => { onSelect(note); onBack() }}
                    onDelete={e => { e.stopPropagation(); onDeleteNote(note) }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Confirm delete all                                                   */}
      {/* ------------------------------------------------------------------ */}
      <ConfirmDialog
        open={confirmDeleteAll}
        title="Delete all notes?"
        description="Every note will be permanently deleted. This cannot be undone. Are you absolutely sure?"
        confirmLabel="Delete Everything"
        destructive
        onConfirm={() => void handleDeleteAllConfirm()}
        onCancel={() => setConfirmDeleteAll(false)}
      />
    </div>
  )
}
