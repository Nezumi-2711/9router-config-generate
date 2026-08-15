import React, { useState } from 'react'
import type { ConnectionConfig } from '../types'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Link2, Key, RefreshCw, Eye, EyeOff, AlertCircle } from 'lucide-react'

interface ConnectionFormProps {
  connection: ConnectionConfig
  onChange: (connection: ConnectionConfig) => void
  onFetchModels: () => void
  isLoading?: boolean
  error?: string | null
  modelsCount?: number
  isLive?: boolean
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  connection,
  onChange,
  onFetchModels,
  isLoading = false,
  error = null,
  modelsCount = 0,
  isLive = false,
}) => {
  const [showKey, setShowKey] = useState(false)

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 m-0">
            1. Gateway Connection
          </h2>
          <Badge variant={isLive ? 'success' : 'brand'} size="sm">
            {isLive ? 'Live Connected' : 'Local Router'}
          </Badge>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">OpenAI compatible</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Input
          label="Base URL"
          placeholder="http://localhost:20128/v1"
          value={connection.baseUrl}
          onChange={(e) => onChange({ ...connection, baseUrl: e.target.value })}
          leftIcon={<Link2 className="w-4 h-4" />}
          helperText="Default 9router endpoint is http://localhost:20128/v1"
        />

        <Input
          label="API Key (Optional)"
          type={showKey ? 'text' : 'password'}
          placeholder="sk-..."
          value={connection.apiKey}
          onChange={(e) => onChange({ ...connection, apiKey: e.target.value })}
          leftIcon={<Key className="w-4 h-4" />}
          helperText="Passed as authorization header if required"
          rightElement={
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors p-1"
              title={showKey ? 'Hide key' : 'Show key'}
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          }
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div
            className={`w-2 h-2 rounded-full ${
              isLive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>
            {isLive
              ? `Live connected (${modelsCount} models loaded)`
              : 'Local mock catalog loaded'}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onFetchModels}
          disabled={isLoading || !connection.baseUrl}
          icon={
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
          }
          title="Fetch models from the specified Base URL and API Key"
        >
          {isLoading ? 'Fetching...' : 'Fetch Models'}
        </Button>
      </div>
    </Card>
  )
}
