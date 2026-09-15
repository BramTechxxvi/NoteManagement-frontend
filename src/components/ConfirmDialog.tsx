import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Trap focus + close on Escape
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  // Prevent body scroll while dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            aria-hidden="true"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-[var(--color-surface)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] border border-[var(--color-border)] p-6">
              {/* Close */}
              <button
                onClick={onCancel}
                aria-label="Close dialog"
                className="absolute top-4 right-4 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Icon + heading */}
              <div className="flex items-start gap-3 mb-3">
                {destructive && (
                  <div className="shrink-0 mt-0.5 p-1.5 rounded-full bg-[var(--color-danger-subtle)]">
                    <AlertTriangle size={16} className="text-[var(--color-danger)]" aria-hidden="true" />
                  </div>
                )}
                <h2
                  id="confirm-title"
                  className="text-base font-semibold text-[var(--color-text-primary)] leading-snug"
                >
                  {title}
                </h2>
              </div>

              <p
                id="confirm-desc"
                className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed"
              >
                {description}
              </p>

              <div className="flex justify-end gap-2">
                <button
                  ref={cancelRef}
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 text-sm font-medium rounded-[var(--radius-md)] text-white transition-colors cursor-pointer ${
                    destructive
                      ? 'bg-[var(--color-danger)] hover:bg-[var(--color-danger-hover)]'
                      : 'bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)]'
                  }`}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
