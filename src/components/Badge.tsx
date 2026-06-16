import { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant =
  | 'primary'
  | 'accent'
  | 'sunny'
  | 'sky'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  icon?: ReactNode
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800',
  accent:  'bg-accent-50 text-accent-700 ring-accent-200 dark:bg-accent-900/30 dark:text-accent-300 dark:ring-accent-800',
  sunny:   'bg-sunny-50 text-sunny-800 ring-sunny-200 dark:bg-sunny-900/30 dark:text-sunny-300 dark:ring-sunny-800',
  sky:     'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-800',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800',
  danger:  'bg-red-50 text-red-700 ring-red-200 dark:bg-red-900/30 dark:text-red-300 dark:ring-red-800',
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200 dark:bg-ink-700 dark:text-ink-200 dark:ring-ink-600',
}

const dotColor: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  accent: 'bg-accent-500',
  sunny: 'bg-sunny-500',
  sky: 'bg-sky-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-ink-500',
}

const sizeMap = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
}

export default function Badge({
  variant = 'primary',
  size = 'md',
  icon,
  dot = false,
  className = '',
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${variants[variant]} ${sizeMap[size]} ${className}`}
      {...rest}
    >
      {dot ? <span className={`h-1.5 w-1.5 rounded-full ${dotColor[variant]}`} /> : null}
      {icon}
      {children}
    </span>
  )
}
