import React, { useState } from 'react'
import type { ToolMeta, ConnectionConfig, Model } from '../types'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { CodeBlock } from './ui/CodeBlock'
import { buildInstallScript, type ScriptOS } from '../services/installScript'
import { buildOneClickCommand } from '../services/installLink'
import { Download, Copy, Check, FileCode, Info, Terminal, Key, Sparkles, ShieldAlert } from 'lucide-react'

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
  const [copiedConfig, setCopiedConfig] = useState(false)
  const [copiedCommand, setCopiedCommand] = useState(false)
  const [selectedOS, setSelectedOS] = useState<ScriptOS>('unix')

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  const oneClickCommand = buildOneClickCommand(tool, connection, selectedModels, selectedOS, origin)

  const configContent = tool.sampleTemplate(connection, selectedModels)
  const installScript = buildInstallScript(tool, connection, selectedModels, selectedOS, {
    keySource: 'runtime-env',
  })

  const handleCopyConfig = async () => {
    try {
      await navigator.clipboard.writeText(configContent)
      setCopiedConfig(true)
      setTimeout(() => setCopiedConfig(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleCopyCommand = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd)
      setCopiedCommand(true)
      setTimeout(() => setCopiedCommand(false), 2000)
    } catch {
      // ignore
    }
  }

  const handleDownloadConfig = () => {
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

  const handleDownloadScript = () => {
    if (!installScript) return
    const blob = new Blob([installScript.content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = installScript.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="lg:sticky lg:top-20 flex flex-col gap-4 min-w-0 w-full">
      {/* 1. Install Script Section (if supported by tool) */}
      {installScript && (
        <Card className="flex flex-col gap-3.5 shadow-md border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-200 dark:border-[#22232c] pb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 shrink-0 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Terminal className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    1-Command Auto Install
                  </span>
                  <Badge variant="brand" size="sm">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Automated
                  </Badge>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 block text-left truncate">
                  Copy &amp; run — script downloads &amp; writes config
                </span>
              </div>
            </div>

            {/* OS selector tabs */}
            <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setSelectedOS('unix')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedOS === 'unix'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                macOS / Linux (.sh)
              </button>
              <button
                type="button"
                onClick={() => setSelectedOS('windows')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedOS === 'windows'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                Windows (.ps1)
              </button>
            </div>
          </div>

          {/* Run Command snippet */}
          <div className="flex flex-col gap-1.5 text-left">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Run this command in your terminal:
            </span>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-zinc-900 text-zinc-200 font-mono text-xs overflow-x-auto border border-zinc-800">
              <span className="break-all selection:bg-amber-500/30">
                {oneClickCommand}
              </span>
              <button
                type="button"
                onClick={() => handleCopyCommand(oneClickCommand)}
                className="shrink-0 p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Copy command"
              >
                {copiedCommand ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Security / Notice */}
          <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-zinc-600 dark:text-zinc-400 text-left">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>
              The URL and command contain no API key. The installer prompts locally for it, then writes it directly into VS Code configuration.
            </span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Need offline installer?
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadScript}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Download Script ({installScript.filename})
            </Button>
          </div>
        </Card>
      )}

      {/* 2. API Key Helper Note for GitHub Copilot (when no key in form) */}
      {tool.id === 'copilot' && !connection.apiKey && (
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-left">
          <div className="flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
            <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Secure API Key Storage in VS Code</span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
            No API key entered above. The generated config uses{' '}
            <code className="px-1 py-0.5 rounded bg-amber-500/15 font-mono text-[11px] text-amber-700 dark:text-amber-300">
              ${'{input:9router-api-key}'}
            </code>
            . When VS Code prompts you for <strong className="font-semibold text-zinc-900 dark:text-zinc-100">9router-api-key</strong>, paste your key.
          </p>
        </div>
      )}

      {/* 3. Raw Config Preview */}
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
                Manual config for {tool.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyConfig}
              icon={copiedConfig ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copiedConfig ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadConfig}
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
          className="max-h-96"
        />

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span>{selectedModels.length} model(s) included</span>
          <span>Live preview interpolated</span>
        </div>
      </Card>
    </div>
  )
}
