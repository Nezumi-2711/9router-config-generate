import React, { useState } from 'react'
import type { ToolMeta, ConnectionConfig, Model } from '../types'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { CodeBlock } from './ui/CodeBlock'
import { Download, Copy, Check, FileCode, Info } from 'lucide-react'

interface ConfigPreviewProps {
  tool: ToolMeta
  connection: ConnectionConfig
  selectedModels: Model[]
}

export const ConfigPreview: React.FC<ConfigPreviewProps> = ({
  tool,
  connection,
  selectedModels,
}) => {
  const [copied, setCopied] = useState(false)

  const configContent = tool.sampleTemplate(connection, selectedModels)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleDownload = () => {
    const blob = new Blob([configContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = tool.targetFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="lg:sticky lg:top-20 flex flex-col gap-4 min-w-0 w-full">
      <Card className="flex flex-col gap-3.5 shadow-md min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-200 dark:border-[#22232c] pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 shrink-0 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {tool.targetFilename}
                </span>
                <Badge variant="brand" size="sm">
                  {tool.language.toUpperCase()}
                </Badge>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block text-left truncate">
                Target for {tool.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-100/60 dark:bg-zinc-800/40 text-xs text-zinc-600 dark:text-zinc-400 text-left">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              Save Location:{' '}
            </span>
            <span>{tool.locationDescription}</span>
          </div>
        </div>

        <CodeBlock
          code={configContent}
          language={tool.language}
          className="max-h-[500px]"
        />

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span>{selectedModels.length} model(s) included</span>
          <span>Live preview interpolated</span>
        </div>
      </Card>
    </div>
  )
}
