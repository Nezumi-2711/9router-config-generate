import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  leftIcon,
  rightElement,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-white dark:bg-[#12131a] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3.5 py-2 text-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 ${
            leftIcon ? 'pl-9' : ''
          } ${rightElement ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {helperText && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400">{helperText}</span>
      )}
    </div>
  )
}
