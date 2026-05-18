import { ReactNode } from 'react'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  eyebrow?: ReactNode
  actions?: ReactNode
  className?: string
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="min-w-0">
        {eyebrow ? (
          <div className="mb-2">
            {typeof eyebrow === 'string' ? <span className="eyebrow">{eyebrow}</span> : eyebrow}
          </div>
        ) : null}
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900 dark:text-ink-50 text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-base text-ink-600 dark:text-ink-300 max-w-2xl">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}
