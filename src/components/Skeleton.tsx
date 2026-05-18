import { HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: 'rect' | 'circle' | 'pill'
}

export default function Skeleton({
  className = '',
  shape = 'rect',
  ...rest
}: SkeletonProps) {
  const shapeCls =
    shape === 'circle'
      ? 'rounded-full'
      : shape === 'pill'
      ? 'rounded-full'
      : 'rounded-lg'

  return (
    <div
      className={`skeleton ${shapeCls} ${className}`}
      aria-hidden="true"
      {...rest}
    />
  )
}
