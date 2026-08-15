import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  className?: string
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  className = '',
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback if clipboard api fails
    }
  }

  return (
    <div className={`relative group rounded-lg overflow-hidden border border-zinc-200 dark:border-[#262732] bg-[#f8f8fa] dark:bg-[#0c0d12] ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200 dark:border-[#22232c] bg-zinc-100/70 dark:bg-[#12131a]/80 text-xs text-zinc-500 font-mono">
        <span>{language ? language.toUpperCase() : 'CODE'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors p-1 rounded hover:bg-zinc-200/50 dark:hover:bg-zinc-800"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto p-3.5 font-mono text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-200 selection:bg-amber-500/20">
        <pre className="m-0 tab-4 whitespace-pre">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  )
}
