import React, { useState } from 'react'
import type { ConnectionConfig } from '../types'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Link2, Key, RefreshCw, Eye, EyeOff } from 'lucide-react'

interface ConnectionFormProps {
  connection: ConnectionConfig
  onChange: (connection: ConnectionConfig) => void
}

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  connection,
  onChange,
}) => {
  const [showKey, setShowKey] = useState(false)

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 m-0">
            1. Gateway Connection
          </h2>
          <Badge variant="brand" size="sm">
            Local Router
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

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local mock catalog loaded</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          title="Live endpoint fetching will be available in next release"
        >
          Fetch Models (Live)
        </Button>
      </div>
    </Card>
  )
}
