import { ReactNode } from 'react'

interface ErrorMessageProps {
  children: ReactNode
  className?: string
}

export default function ErrorMessage({ children, className = '' }: ErrorMessageProps) {
  return (
    <p className={`text-sm text-red-600 mt-1 ${className}`}>
      {children}
    </p>
  )
}

