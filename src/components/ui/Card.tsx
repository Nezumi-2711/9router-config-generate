import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  interactive?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  selected = false,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-150 p-4 ${
        selected
          ? 'bg-white dark:bg-[#161720] border-amber-500 dark:border-amber-500 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500'
          : 'bg-white dark:bg-[#14151c] border-zinc-200 dark:border-[#262732]'
      } ${
        interactive
          ? 'cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
