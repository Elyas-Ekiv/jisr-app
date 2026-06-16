import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react'
import { motion } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'

type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'subtle'
  | 'accent'
  | 'danger'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onAnimationEnd' | 'onDragStart' | 'onDrag' | 'onDragEnd'
>

interface ButtonProps extends NativeButtonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 shadow-soft hover:shadow-card focus-visible:ring-accent-400',
  secondary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft hover:shadow-card focus-visible:ring-primary-400',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200 focus-visible:ring-ink-300 ' +
    'dark:text-ink-200 dark:hover:bg-ink-700 dark:active:bg-ink-600',
  outline:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 active:bg-primary-100 focus-visible:ring-primary-300 ' +
    'dark:bg-transparent dark:text-primary-300 dark:border-primary-700 dark:hover:bg-primary-900/20 dark:active:bg-primary-900/30',
  subtle:
    'bg-primary-50 text-primary-700 hover:bg-primary-100 active:bg-primary-200 focus-visible:ring-primary-300 ' +
    'dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 dark:active:bg-primary-900/70',
  accent:
    'bg-accent-100 text-accent-800 hover:bg-accent-200 active:bg-accent-300 focus-visible:ring-accent-300 ' +
    'dark:bg-accent-900/30 dark:text-accent-200 dark:hover:bg-accent-900/50 dark:active:bg-accent-900/70',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft hover:shadow-card focus-visible:ring-red-400',
}

const sizeStyles: Record<Size, string> = {
  xs: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-3.5 text-sm gap-1.5 rounded-lg',
  md: 'h-11 px-5 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
  xl: 'h-14 px-7 text-base gap-2.5 rounded-2xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const base =
      'relative inline-flex items-center justify-center font-semibold whitespace-nowrap select-none ' +
      'transition-all duration-150 focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none'

    return (
      <motion.button
        ref={ref}
        type={type}
        whileHover={disabled || loading ? undefined : { scale: 1.015 }}
        whileTap={disabled || loading ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        disabled={disabled || loading}
        className={[
          base,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth ? 'w-full' : '',
          className,
        ].join(' ')}
        {...(props as any)}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" className="!flex" />
            <span className="opacity-90">Loading…</span>
          </>
        ) : (
          <>
            {leftIcon ? <span className="inline-flex shrink-0">{leftIcon}</span> : null}
            <span>{children}</span>
            {rightIcon ? <span className="inline-flex shrink-0">{rightIcon}</span> : null}
          </>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'

export default Button
