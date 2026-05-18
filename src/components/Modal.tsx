import { ReactNode, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  hideClose?: boolean
}

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  hideClose = false,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90]" aria-modal="true" role="dialog">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className={`relative w-full ${sizeMap[size]} max-h-[92vh] overflow-hidden rounded-3xl bg-white dark:bg-ink-800 shadow-card ring-1 ring-ink-100 dark:ring-ink-700`}
            >
              {(title || !hideClose) && (
                <div className="flex items-start justify-between gap-4 border-b border-ink-100 dark:border-ink-700 px-6 pt-5 pb-4">
                  <div className="min-w-0">
                    {title ? (
                      <h2 className="text-xl font-bold text-ink-900 dark:text-ink-50">{title}</h2>
                    ) : null}
                    {description ? (
                      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{description}</p>
                    ) : null}
                  </div>
                  {!hideClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close modal"
                      className="rounded-lg p-2 text-ink-500 dark:text-ink-400 transition-colors hover:bg-ink-100 dark:hover:bg-ink-700 hover:text-ink-900 dark:hover:text-ink-50"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(92vh - 4rem)' }}>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
