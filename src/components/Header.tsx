import React from 'react'
import { Sparkles, Terminal, Globe } from 'lucide-react'

export const Header: React.FC = () => {
  return (
    <header className="border-b border-zinc-200 dark:border-[#22232c] bg-white/70 dark:bg-[#121319]/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/25">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white m-0 font-sans">
                9router Config Generator
              </h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                v1.0
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 m-0">
              Generate ready-to-paste AI coding tool configs for your local gateway
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
          <a
            href="http://localhost:20128"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>9router Local</span>
          </a>
        </div>
      </div>
    </header>
  )
}
