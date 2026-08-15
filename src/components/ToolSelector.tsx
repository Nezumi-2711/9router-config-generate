import React from 'react'
import type { ToolId, ToolMeta } from '../types'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Bot, Terminal, Cpu, Check } from 'lucide-react'

interface ToolSelectorProps {
  tools: ToolMeta[]
  selectedTool: ToolId
  onSelectTool: (id: ToolId) => void
}

export const ToolSelector: React.FC<ToolSelectorProps> = ({
  tools,
  selectedTool,
  onSelectTool,
}) => {
  const getIcon = (iconName: ToolMeta['iconName']) => {
    switch (iconName) {
      case 'bot':
        return <Bot className="w-5 h-5" />
      case 'terminal':
        return <Terminal className="w-5 h-5" />
      case 'cpu':
        return <Cpu className="w-5 h-5" />
    }
  }

  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 m-0">
            3. Choose Target Tool
          </h2>
          <Badge variant="outline" size="sm">
            {tools.length} available
          </Badge>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">Single select</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id
          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className={`relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'bg-zinc-50/50 dark:bg-[#121319]/50 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${
                    isSelected
                      ? 'bg-amber-500 text-white'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {getIcon(tool.iconName)}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-0.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 leading-snug">
                  {tool.tagline}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400 truncate block">
                  {tool.targetFilename}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
