import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, Info, X, XCircle } from 'lucide-react'
import { type Toast, useToast } from './ToastContext'

const icons: Record<Toast['variant'], React.ReactNode> = {
  success: <CheckCircle size={16} aria-hidden="true" />,
  error: <XCircle size={16} aria-hidden="true" />,
  info: <Info size={16} aria-hidden="true" />,
}

const variantStyles: Record<Toast['variant'], string> = {
  success: 'bg-[var(--color-success-subtle)] text-[var(--color-success)] border-[color:color-mix(in_srgb,var(--color-success)_20%,transparent)]',
  error: 'bg-[var(--color-danger-subtle)] text-[var(--color-danger)] border-[color:color-mix(in_srgb,var(--color-danger)_20%,transparent)]',
  info: 'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)]',
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
    >
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            role="status"
            className={`pointer-events-auto flex items-start gap-2.5 rounded-[var(--radius-md)] border px-3.5 py-2.5 shadow-[var(--shadow-md)] text-sm font-medium max-w-sm ${variantStyles[t.variant]}`}
          >
            <span className="mt-px shrink-0">{icons[t.variant]}</span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
              className="shrink-0 mt-px opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
