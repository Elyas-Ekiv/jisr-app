import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  title?: string
}

const styles = {
  success: {
    Icon: CheckCircle2,
    ring: 'ring-emerald-100',
    bg: 'bg-white',
    iconBg: 'bg-emerald-50 text-emerald-600',
    accent: 'bg-emerald-500',
  },
  error: {
    Icon: XCircle,
    ring: 'ring-accent-100',
    bg: 'bg-white',
    iconBg: 'bg-accent-50 text-accent-600',
    accent: 'bg-accent-500',
  },
  info: {
    Icon: Info,
    ring: 'ring-sky-100',
    bg: 'bg-white',
    iconBg: 'bg-sky-50 text-sky-600',
    accent: 'bg-sky-500',
  },
  warning: {
    Icon: AlertTriangle,
    ring: 'ring-sunny-100',
    bg: 'bg-white',
    iconBg: 'bg-sunny-50 text-sunny-700',
    accent: 'bg-sunny-500',
  },
} as const

export default function Toast({ message, type = 'info', isVisible, onClose, title }: ToastProps) {
  const style = styles[type]
  const { Icon } = style

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: '-50%', scale: 0.96 }}
          animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
          exit={{ opacity: 0, y: -16, x: '-50%', scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="fixed top-4 left-1/2 z-[100] w-[min(28rem,calc(100vw-2rem))]"
          role="status"
          aria-live="polite"
        >
          <div
            className={`relative overflow-hidden rounded-2xl ${style.bg} shadow-card ring-1 ${style.ring} border border-ink-100`}
          >
            <div className={`absolute inset-y-0 left-0 w-1 ${style.accent}`} />
            <div className="flex items-start gap-3 p-4 pl-5">
              <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-xl ${style.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                {title ? (
                  <p className="text-sm font-semibold text-ink-900">{title}</p>
                ) : null}
                <p className="text-sm leading-snug text-ink-700">{message}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss notification"
                className="rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
