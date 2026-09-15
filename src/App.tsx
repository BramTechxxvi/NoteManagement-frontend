import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useCallback, useState } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { NoteEditor } from '@/components/NoteEditor'
import type { EditorMode } from '@/components/NoteEditor'
import { Sidebar } from '@/components/Sidebar'
import { ToastContainer, ToastProvider, useToast } from '@/components/Toast'
import { useNotes } from '@/hooks/useNotes'
import type { Note } from '@/types/note'

// ---------------------------------------------------------------------------
// Inner app — has access to toast context
// ---------------------------------------------------------------------------

function NotesApp() {
  const { toast } = useToast()
  const { notes, fetchStatus, fetchError, mutating, mutationError, refresh, create, update, remove, removeAll, clearMutationError } = useNotes()

  // Selected note & editor mode
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [mode, setMode] = useState<EditorMode>('view')

  // Mobile: whether to show the note panel (true) or sidebar (false)
  const [mobileShowEditor, setMobileShowEditor] = useState(false)

  // Confirm dialogs
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false)

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleSelectNote = useCallback((note: Note) => {
    setSelectedNote(note)
    setMode('view')
    setMobileShowEditor(true)
    clearMutationError()
  }, [clearMutationError])

  const handleNewNote = useCallback(() => {
    setSelectedNote(null)
    setMode('new')
    setMobileShowEditor(true)
    clearMutationError()
  }, [clearMutationError])

  const handleEdit = useCallback(() => {
    setMode('edit')
  }, [])

  const handleCancelEdit = useCallback(() => {
    if (mode === 'new') {
      // Discard: go back to selection or empty state
      setMobileShowEditor(selectedNote !== null)
      setMode('view')
    } else {
      setMode('view')
    }
  }, [mode, selectedNote])

  const handleSave = useCallback(
    async (title: string, content: string) => {
      if (mode === 'new') {
        const created = await create({ title, content })
        if (created) {
          setSelectedNote(created)
          setMode('view')
          toast('Note created', 'success')
        }
      } else if (mode === 'edit' && selectedNote) {
        const updated = await update(selectedNote.id, { title, content })
        if (updated) {
          setSelectedNote(updated)
          setMode('view')
          toast('Note saved', 'success')
        }
      }
    },
    [mode, selectedNote, create, update, toast],
  )

  const handleDeleteRequest = useCallback((note: Note) => {
    setDeleteTarget(note)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return
    const targetId = deleteTarget.id
    setDeleteTarget(null)
    const ok = await remove(targetId)
    if (ok) {
      toast('Note deleted', 'success')
      if (selectedNote?.id === targetId) {
        setSelectedNote(null)
        setMode('view')
        setMobileShowEditor(false)
      }
    } else if (mutationError) {
      toast(mutationError, 'error')
    }
  }, [deleteTarget, remove, selectedNote, mutationError, toast])

  const handleDeleteAll = useCallback(() => {
    setConfirmDeleteAll(true)
  }, [])

  const handleDeleteAllConfirm = useCallback(async () => {
    setConfirmDeleteAll(false)
    const ok = await removeAll()
    if (ok) {
      setSelectedNote(null)
      setMode('view')
      setMobileShowEditor(false)
      toast('All notes deleted', 'success')
    } else if (mutationError) {
      toast(mutationError, 'error')
    }
  }, [removeAll, mutationError, toast])

  const handleMobileBack = useCallback(() => {
    setMobileShowEditor(false)
    if (mode === 'new') {
      setMode('view')
      setSelectedNote(null)
    }
  }, [mode])

  // Show mutation errors as toasts when they surface
  // (handled inline via the error response in save handlers, but
  //  also shown directly here for delete operations)
  const showEditor = mode === 'new' || selectedNote !== null

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Main layout — sidebar + editor                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex h-full overflow-hidden">

        {/* ---- SIDEBAR ---- */}
        {/* Desktop: always visible. Mobile: hidden when editor is open */}
        <div
          className={[
            'flex-shrink-0 flex flex-col',
            // Desktop: fixed width sidebar
            'md:w-72 lg:w-80',
            // Mobile: full width, toggled
            'w-full md:block',
            mobileShowEditor ? 'hidden md:flex' : 'flex',
          ].join(' ')}
        >
          <Sidebar
            notes={notes}
            fetchStatus={fetchStatus}
            fetchError={fetchError}
            selectedId={selectedNote?.id ?? null}
            onSelect={handleSelectNote}
            onNewNote={handleNewNote}
            onRefresh={() => void refresh()}
            onDeleteAll={handleDeleteAll}
          />
        </div>

        {/* ---- EDITOR PANEL ---- */}
        {/* Desktop: always visible. Mobile: toggled */}
        <main
          className={[
            'flex-1 flex flex-col min-w-0 overflow-hidden',
            'bg-[var(--color-surface)]',
            mobileShowEditor ? 'flex' : 'hidden md:flex',
          ].join(' ')}
          aria-label="Note editor"
        >
          {/* Mobile back button */}
          <div className="md:hidden flex items-center px-3 py-2 border-b border-[var(--color-border-subtle)] shrink-0">
            <button
              onClick={handleMobileBack}
              className="flex items-center gap-1 text-sm text-[var(--color-accent)] font-medium cursor-pointer py-1 px-1.5 rounded hover:bg-[var(--color-accent-subtle)] transition-colors"
              aria-label="Back to notes list"
            >
              <ChevronLeft size={16} aria-hidden="true" />
              Notes
            </button>
          </div>

          <AnimatePresence mode="wait">
            {showEditor ? (
              <motion.div
                key={`${selectedNote?.id ?? 'new'}-${mode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1 overflow-hidden"
              >
                <NoteEditor
                  note={selectedNote}
                  mode={mode}
                  isSaving={mutating}
                  saveError={mutationError}
                  onSave={handleSave}
                  onDelete={handleDeleteRequest}
                  onEdit={handleEdit}
                  onCancelEdit={handleCancelEdit}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="flex-1"
              >
                <EmptyState onNewNote={handleNewNote} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Confirm: delete single note                                          */}
      {/* ------------------------------------------------------------------ */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete note?"
        description={
          deleteTarget
            ? `"${deleteTarget.title || 'Untitled'}" will be permanently deleted and cannot be recovered.`
            : ''
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Confirm: delete ALL notes                                            */}
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

      {/* Toasts */}
      <ToastContainer />
    </>
  )
}

// ---------------------------------------------------------------------------
// Root — provides toast context
// ---------------------------------------------------------------------------

export default function App() {
  return (
    <ToastProvider>
      <NotesApp />
    </ToastProvider>
  )
}
