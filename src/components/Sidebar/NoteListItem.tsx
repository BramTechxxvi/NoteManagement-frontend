import { motion } from 'framer-motion'
import { cx, formatDate, truncate } from '@/lib/utils'
import type { Note } from '@/types/note'

interface NoteListItemProps {
  note: Note
  isSelected: boolean
  onClick: () => void
}

export function NoteListItem({ note, isSelected, onClick }: NoteListItemProps) {
  const date = formatDate(note.updatedAt ?? note.createdAt)

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      aria-current={isSelected ? 'true' : undefined}
      className={cx(
        'w-full text-left px-3 py-2.5 rounded-[var(--radius-md)] transition-colors cursor-pointer group',
        isSelected
          ? 'bg-[var(--color-accent-subtle)] border border-[var(--color-accent-muted)]'
          : 'hover:bg-[var(--color-surface-muted)] border border-transparent',
      )}
    >
      <p
        className={cx(
          'text-sm font-medium leading-snug truncate',
          isSelected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-primary)]',
        )}
      >
        {note.title || <span className="italic text-[var(--color-text-muted)]">Untitled</span>}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate leading-snug">
        {note.content ? truncate(note.content, 80) : <span className="italic">No content</span>}
      </p>
      {date && (
        <p className="text-[11px] text-[var(--color-text-muted)] mt-1 opacity-70">{date}</p>
      )}
    </motion.button>
  )
}
