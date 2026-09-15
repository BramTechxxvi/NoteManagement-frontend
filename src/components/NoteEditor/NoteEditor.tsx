import { AnimatePresence, motion } from 'framer-motion'
import { Check, Clock, Loader2, Pencil, Save, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cx, formatDateTime } from '@/lib/utils'
import type { Note } from '@/types/note'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EditorMode = 'view' | 'edit' | 'new'

interface NoteEditorProps {
  note: Note | null
  mode: EditorMode
  isSaving: boolean
  saveError: string | null
  onSave: (title: string, content: string) => Promise<void>
  onDelete: (note: Note) => void
  onEdit: () => void
  onCancelEdit: () => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isDirty(note: Note | null, title: string, content: string): boolean {
  if (!note) return title.trim() !== '' || content.trim() !== ''
  return note.title !== title || note.content !== content
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function NoteEditor({
  note,
  mode,
  isSaving,
  saveError,
  onSave,
  onDelete,
  onEdit,
  onCancelEdit,
}: NoteEditorProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [validationError, setValidationError] = useState<string | null>(null)
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Sync fields when the selected note changes or mode changes
  useEffect(() => {
    setTitle(note?.title ?? '')
    setContent(note?.content ?? '')
    setValidationError(null)
  }, [note?.id, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus title in edit/new mode
  useEffect(() => {
    if (mode === 'edit' || mode === 'new') {
      titleRef.current?.focus()
    }
  }, [mode])

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle && !trimmedContent) {
      setValidationError('Please add a title or some content before saving.')
      return
    }
    setValidationError(null)
    await onSave(trimmedTitle || 'Untitled', trimmedContent)
  }, [title, content, onSave])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        void handleSave()
      }
      if (e.key === 'Escape') {
        onCancelEdit()
      }
    },
    [handleSave, onCancelEdit],
  )

  const dirty = isDirty(note, title, content)
  const isEditable = mode === 'edit' || mode === 'new'

  const updatedAt = note?.updatedAt ?? note?.createdAt
  const dateStr = formatDateTime(updatedAt)

  return (
    <motion.div
      key={`${note?.id ?? 'new'}-${mode}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className="flex flex-col h-full bg-[var(--color-surface)]"
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--color-border-subtle)] shrink-0">
        <div className="flex items-center gap-2">
          {dateStr && mode === 'view' && (
            <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Clock size={11} aria-hidden="true" />
              {dateStr}
            </span>
          )}
          {mode === 'new' && (
            <span className="text-xs font-medium text-[var(--color-accent)]">New note</span>
          )}
          {mode === 'edit' && (
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Editing</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Cancel edit */}
          {isEditable && (
            <button
              onClick={onCancelEdit}
              aria-label="Cancel editing"
              title="Cancel (Esc)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
            >
              <X size={13} aria-hidden="true" />
              Cancel
            </button>
          )}

          {/* Save */}
          {isEditable && (
            <button
              onClick={() => void handleSave()}
              disabled={isSaving || !dirty}
              aria-label={isSaving ? 'Saving…' : 'Save note'}
              title="Save (⌘ Enter)"
              className={cx(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] text-white transition-colors cursor-pointer',
                isSaving || !dirty
                  ? 'bg-[var(--color-accent)] opacity-50 cursor-not-allowed'
                  : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]',
              )}
            >
              {isSaving ? (
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={13} aria-hidden="true" />
              )}
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          )}

          {/* Edit */}
          {mode === 'view' && note && (
            <button
              onClick={onEdit}
              aria-label="Edit note"
              title="Edit note"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
            >
              <Pencil size={13} aria-hidden="true" />
              Edit
            </button>
          )}

          {/* Delete — view mode only, less prominent */}
          {mode === 'view' && note && (
            <button
              onClick={() => onDelete(note)}
              aria-label="Delete note"
              title="Delete note"
              className="p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-subtle)] transition-colors cursor-pointer"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Editor / Viewer body */}
      <div className="flex-1 overflow-y-auto" onKeyDown={handleKeyDown}>
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-4 h-full">
          {/* Title */}
          {isEditable ? (
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                setValidationError(null)
              }}
              placeholder="Note title"
              aria-label="Note title"
              maxLength={255}
              className="w-full text-2xl font-semibold text-[var(--color-text-primary)] bg-transparent border-none outline-none placeholder:text-[var(--color-text-muted)] placeholder:font-normal"
            />
          ) : (
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] leading-snug break-words">
              {note?.title || <span className="text-[var(--color-text-muted)] font-normal italic">Untitled</span>}
            </h1>
          )}

          {/* Subtle divider */}
          <hr className="border-[var(--color-border-subtle)]" />

          {/* Validation error */}
          <AnimatePresence>
            {(validationError ?? saveError) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 px-3 py-2.5 rounded-[var(--radius-md)] bg-[var(--color-danger-subtle)] border border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)]"
              >
                <p className="text-xs text-[var(--color-danger)]">
                  {validationError ?? saveError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Content */}
          {isEditable ? (
            <textarea
              ref={contentRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Start writing…"
              aria-label="Note content"
              className="note-content w-full bg-transparent border-none outline-none placeholder:text-[var(--color-text-muted)] flex-1"
              style={{ minHeight: '300px' }}
            />
          ) : (
            <div className="note-content flex-1">
              {note?.content ? (
                note.content
              ) : (
                <span className="italic text-[var(--color-text-muted)]">No content</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Keyboard shortcut hint — edit mode */}
      {isEditable && (
        <div className="px-6 py-2 border-t border-[var(--color-border-subtle)] shrink-0">
          <p className="text-[11px] text-[var(--color-text-muted)]">
            <kbd className="font-mono">⌘ Enter</kbd> to save &nbsp;·&nbsp;{' '}
            <kbd className="font-mono">Esc</kbd> to cancel
          </p>
        </div>
      )}

      {/* Saved indicator — briefly show after save */}
      <AnimatePresence>
        {!isSaving && !saveError && !isEditable && note && (
          <motion.div
            key="saved"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0 }}
            className="hidden"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Success flash shown in parent after save
export function SavedBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-1 text-xs text-[var(--color-success)] font-medium"
    >
      <Check size={12} aria-hidden="true" />
      Saved
    </motion.span>
  )
}
