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
import { AllNotesPage } from '@/pages/AllNotesPage'
import type { Note } from '@/types/note'


type AppView = 'workspace' | 'all-notes'

// ---------------------------------------------------------------------------
// Inner app — has access to toast context
// ---------------------------------------------------------------------------

function NotesApp() {
  const { toast } = useToast()
  const {
    notes,
    fetchStatus,
    fetchError,
    mutating,
    mutationError,
    refresh,
    create,
    update,
    remove,
    removeAll,
    clearMutationError,
  } = useNotes()

  // Top-level view
  const [appView, setAppView] = useState<AppView>('workspace')

  // Selected note & editor mode
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [mode, setMode] = useState<EditorMode>('view')

  // Mobile: whether to show the note panel (true) or sidebar (false)
  const [mobileShowEditor, setMobileShowEditor] = useState(false)

  // Confirm dialog for single-note deletion (used in workspace view)
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null)

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleViewAll = useCallback(() => {
    setAppView('all-notes')
  }, [])

  const handleBackToWorkspace = useCallback(() => {
    setAppView('workspace')
  }, [])

  // ---------------------------------------------------------------------------
  // Note selection & editor handlers
  // ---------------------------------------------------------------------------

  const handleSelectNote = useCallback(
    (note: Note) => {
      setSelectedNote(note)
      setMode('view')
      setMobileShowEditor(true)
      clearMutationError()
    },
    [clearMutationError],
  )

  const handleNewNote = useCallback(() => {
    setAppView('workspace')   // always go to workspace to create
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

  // ---------------------------------------------------------------------------
  // Delete single note
  // ---------------------------------------------------------------------------

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
    } else {
      toast(mutationError ?? 'Failed to delete note', 'error')
    }
  }, [deleteTarget, remove, selectedNote, mutationError, toast])

  // ---------------------------------------------------------------------------
  // Delete all notes (called from AllNotesPage, which owns its confirm dialog)
  // ---------------------------------------------------------------------------

  const handleDeleteAll = useCallback(async (): Promise<boolean> => {
    const ok = await removeAll()
    if (ok) {
      setSelectedNote(null)
      setMode('view')
      setMobileShowEditor(false)
      toast('All notes deleted', 'success')
    } else {
      toast(mutationError ?? 'Failed to delete all notes', 'error')
    }
    return ok
  }, [removeAll, mutationError, toast])

  // ---------------------------------------------------------------------------
  // Mobile back
  // ---------------------------------------------------------------------------

  const handleMobileBack = useCallback(() => {
    setMobileShowEditor(false)
    if (mode === 'new') {
      setMode('view')
      setSelectedNote(null)
    }
  }, [mode])

  const showEditor = mode === 'new' || selectedNote !== null

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <AnimatePresence mode="wait">
        {appView === 'all-notes' ? (
          /* ---------------------------------------------------------------- */
          /* Full-page All Notes view                                          */
          /* ---------------------------------------------------------------- */
          <motion.div
            key="all-notes"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col h-full"
          >
            <AllNotesPage
              notes={notes}
              fetchStatus={fetchStatus}
              fetchError={fetchError}
              selectedId={selectedNote?.id ?? null}
              onBack={handleBackToWorkspace}
              onSelect={handleSelectNote}
              onNewNote={handleNewNote}
              onDeleteNote={handleDeleteRequest}
              onDeleteAll={handleDeleteAll}
            />
          </motion.div>
        ) : (
          /* ---------------------------------------------------------------- */
          /* Normal workspace: sidebar + editor                                */
          /* ---------------------------------------------------------------- */
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex h-full overflow-hidden"
          >
            {/* ---- SIDEBAR ---- */}
            <div
              className={[
                'flex-shrink-0 flex flex-col',
                'md:w-72 lg:w-80',
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
                onViewAll={handleViewAll}
              />
            </div>

            {/* ---- EDITOR PANEL ---- */}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Confirm: delete single note (shared across both views)              */}
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
