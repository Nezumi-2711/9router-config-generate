import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'brand' | 'outline' | 'success'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  }[size]

  const variantClasses = {
    default:
      'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium',
    brand:
      'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20',
    outline:
      'border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 font-medium',
    success:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium border border-emerald-500/20',
  }[variant]

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md whitespace-nowrap leading-none transition-colors ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  )
}
