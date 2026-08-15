import React, { useMemo } from 'react'
import type { Model } from '../types'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { Input } from './ui/Input'
import { Search, CheckSquare, Square, Eye, Wrench, Layers } from 'lucide-react'

interface ModelListProps {
  models: Model[]
  selectedIds: string[]
  searchQuery: string
  onSearchChange: (q: string) => void
  onToggleModel: (id: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
}

export const ModelList: React.FC<ModelListProps> = ({
  models,
  selectedIds,
  searchQuery,
  onSearchChange,
  onToggleModel,
  onSelectAll,
  onDeselectAll,
}) => {
  const filteredModels = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return models
    return models.filter(
      (m) =>
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        (m.provider && m.provider.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q))
    )
  }, [models, searchQuery])

  const allFilteredSelected =
    filteredModels.length > 0 &&
    filteredModels.every((m) => selectedIds.includes(m.id))

  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 m-0">
            2. Select Models
          </h2>
          <Badge variant="brand" size="sm">
            {selectedIds.length} selected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={allFilteredSelected ? onDeselectAll : onSelectAll}
            className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors"
          >
            {allFilteredSelected ? 'Deselect visible' : 'Select all visible'}
          </button>
        </div>
      </div>

      <Input
        placeholder="Filter models by id, provider, name..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        leftIcon={<Search className="w-4 h-4" />}
        className="text-xs"
      />

      <div className="max-h-72 overflow-y-auto pr-1 flex flex-col gap-2">
        {filteredModels.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            No models matching "{searchQuery}"
          </div>
        ) : (
          filteredModels.map((model) => {
            const isSelected = selectedIds.includes(model.id)
            return (
              <div
                key={model.id}
                onClick={() => onToggleModel(model.id)}
                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none text-left ${
                  isSelected
                    ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/40 dark:border-amber-500/30'
                    : 'bg-zinc-50/50 dark:bg-[#121319]/50 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <button
                  type="button"
                  aria-label={isSelected ? `Deselect ${model.name}` : `Select ${model.name}`}
                  className="mt-0.5 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {model.id}
                    </span>
                    {model.provider && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                        {model.provider}
                      </span>
                    )}
                  </div>
                  {model.name && model.name !== model.id && (
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                      {model.name}
                    </p>
                  )}
                  {model.description && (
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                      {model.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 text-[10px] text-zinc-400">
                  {model.contextWindow && (
                    <span className="flex items-center gap-0.5 font-mono" title="Context window">
                      <Layers className="w-3 h-3 text-zinc-400" />
                      {(model.contextWindow / 1000).toFixed(0)}k
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    {model.vision && (
                      <span title="Supports Vision" className="flex items-center">
                        <Eye className="w-3 h-3 text-zinc-400" />
                      </span>
                    )}
                    {model.toolCalling && (
                      <span title="Supports Function Calling" className="flex items-center">
                        <Wrench className="w-3 h-3 text-zinc-400" />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
