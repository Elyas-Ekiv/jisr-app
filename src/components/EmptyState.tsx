import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 dark:border-ink-700 bg-ink-50/40 dark:bg-ink-800/30 px-6 py-12 text-center ${className}`}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-ink-700 shadow-soft text-primary-600 dark:text-primary-400">
        {icon || <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-semibold text-ink-900 dark:text-ink-50">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-md text-sm text-ink-600 dark:text-ink-300">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </motion.div>
  )
}
