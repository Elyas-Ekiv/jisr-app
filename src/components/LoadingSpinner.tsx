import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizeMap = {
  xs: 'h-3.5 w-3.5 border-[2px]',
  sm: 'h-4 w-4 border-[2px]',
  md: 'h-7 w-7 border-[3px]',
  lg: 'h-10 w-10 border-[3px]',
}

export default function LoadingSpinner({
  size = 'md',
  className = '',
  label,
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className={`inline-block rounded-full border-current/20 border-t-current text-primary-500 ${sizeMap[size]}`}
        style={{
          borderColor: 'currentColor',
          borderTopColor: 'transparent',
          opacity: 0.85,
        }}
      />
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  )
}
