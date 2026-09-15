import { FileText } from 'lucide-react'

interface EmptyStateProps {
  onNewNote: () => void
}

/**
 * Shown in the main content area when no note is selected.
 * Intentional placeholder — never leaves the user staring at a blank screen.
 */
export function EmptyState({ onNewNote }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center select-none">
      <div className="mb-5 p-4 rounded-full bg-[var(--color-surface-muted)]">
        <FileText
          size={28}
          className="text-[var(--color-text-muted)] opacity-60"
          aria-hidden="true"
        />
      </div>
      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Select a note
      </h2>
      <p className="text-sm text-[var(--color-text-muted)] max-w-xs leading-relaxed">
        Choose a note from the sidebar to read or edit it, or create something new.
      </p>
      <button
        onClick={onNewNote}
        className="mt-5 px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white transition-colors cursor-pointer"
      >
        + New Note
      </button>
    </div>
  )
}
