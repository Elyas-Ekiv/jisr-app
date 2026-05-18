import { InputHTMLAttributes, ReactNode, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  inputClassName?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      className = '',
      inputClassName = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const reactId = useId()
    const inputId = id || `field-${reactId}`
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    return (
      <div className={`field ${className}`}>
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-ink-800 dark:text-ink-200 mb-1.5"
          >
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-400">
              {leftIcon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={[
              'field-input',
              leftIcon ? 'pl-11' : '',
              rightIcon ? 'pr-11' : '',
              error ? 'field-input-error' : '',
              disabled ? 'opacity-60 cursor-not-allowed bg-ink-50' : '',
              inputClassName,
            ].join(' ')}
            {...props}
          />
          {rightIcon ? (
            <div className="absolute inset-y-0 right-3.5 flex items-center text-ink-400">
              {rightIcon}
            </div>
          ) : null}
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 text-xs font-medium text-accent-600">
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1.5 text-xs text-ink-500">
            {hint}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
