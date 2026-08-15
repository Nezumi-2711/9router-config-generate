import { useState, useMemo } from 'react'
import type { ToolId, ConnectionConfig } from './types'
import { mockModels } from './data/mockModels'
import { tools, toolList } from './data/tools'
import { Header } from './components/Header'
import { ConnectionForm } from './components/ConnectionForm'
import { ModelList } from './components/ModelList'
import { ToolSelector } from './components/ToolSelector'
import { ConfigPreview } from './components/ConfigPreview'

export function App() {
  const [connection, setConnection] = useState<ConnectionConfig>({
    baseUrl: 'http://localhost:20128/v1',
    apiKey: '',
  })

  // Default select 2 popular models
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([
    'cc/claude-sonnet-4.5',
    'openai/gpt-4o',
  ])

  const [selectedToolId, setSelectedToolId] = useState<ToolId>('copilot')
  const [searchQuery, setSearchQuery] = useState('')

  const handleToggleModel = (id: string) => {
    setSelectedModelIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    const q = searchQuery.toLowerCase().trim()
    const visibleIds = mockModels
      .filter(
        (m) =>
          !q ||
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          (m.provider && m.provider.toLowerCase().includes(q)) ||
          (m.description && m.description.toLowerCase().includes(q))
      )
      .map((m) => m.id)

    setSelectedModelIds((prev) => Array.from(new Set([...prev, ...visibleIds])))
  }

  const handleDeselectAll = () => {
    const q = searchQuery.toLowerCase().trim()
    const visibleIds = new Set(
      mockModels
        .filter(
          (m) =>
            !q ||
            m.id.toLowerCase().includes(q) ||
            m.name.toLowerCase().includes(q) ||
            (m.provider && m.provider.toLowerCase().includes(q)) ||
            (m.description && m.description.toLowerCase().includes(q))
        )
        .map((m) => m.id)
    )

    setSelectedModelIds((prev) => prev.filter((id) => !visibleIds.has(id)))
  }

  const selectedModels = useMemo(() => {
    return mockModels.filter((m) => selectedModelIds.includes(m.id))
  }, [selectedModelIds])

  const activeTool = tools[selectedToolId] || tools.copilot

  return (
    <div className="min-h-screen flex flex-col bg-[var(--app-bg)] text-[var(--app-fg)]">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] gap-6 items-start">
          {/* Left Controls Pane */}
          <div className="flex flex-col gap-6 min-w-0">
            <ConnectionForm
              connection={connection}
              onChange={setConnection}
            />

            <ModelList
              models={mockModels}
              selectedIds={selectedModelIds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onToggleModel={handleToggleModel}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            <ToolSelector
              tools={toolList}
              selectedTool={selectedToolId}
              onSelectTool={setSelectedToolId}
            />
          </div>

          {/* Right Sticky Preview Pane */}
          <div>
            <ConfigPreview
              tool={activeTool}
              connection={connection}
              selectedModels={selectedModels}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
