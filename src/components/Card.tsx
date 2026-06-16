import { ReactNode, forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type CardVariant = 'default' | 'elevated' | 'outline' | 'ghost' | 'gradient' | 'primary'

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  variant?: CardVariant
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const variants: Record<CardVariant, string> = {
  default:
    'bg-white border border-ink-100 shadow-soft dark:bg-ink-800 dark:border-ink-700 dark:text-ink-100',
  elevated:
    'bg-white border border-ink-100 shadow-card dark:bg-ink-800 dark:border-ink-700 dark:text-ink-100',
  outline: 'bg-white border-2 border-ink-200 dark:bg-ink-800 dark:border-ink-600 dark:text-ink-100',
  ghost: 'bg-ink-50/60 border border-ink-100 dark:bg-ink-900/50 dark:border-ink-700 dark:text-ink-100',
  gradient:
    'bg-gradient-to-br from-white to-primary-50/40 border border-primary-100 shadow-soft dark:from-ink-800 dark:to-ink-900 dark:border-ink-600 dark:text-ink-100',
  primary:
    'bg-primary-600 border border-primary-700 shadow-card text-white',
}

const padMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
  xl: 'p-10',
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, variant = 'default', hover = false, padding = 'none', className = '', ...rest },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -3 } : undefined}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className={[
          'rounded-2xl transition-shadow duration-200',
          hover ? 'hover:shadow-card cursor-pointer' : '',
          variants[variant],
          padMap[padding],
          className,
        ].join(' ')}
        {...rest}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export default Card
