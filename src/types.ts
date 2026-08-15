export type ToolId = 'copilot' | 'claude-code' | 'codex'

export interface Model {
  id: string
  name: string
  contextWindow?: number
  provider?: string
  description?: string
  family?: string
  vision?: boolean
  toolCalling?: boolean
}

export interface ConnectionConfig {
  baseUrl: string
  apiKey: string
}

export interface ToolMeta {
  id: ToolId
  name: string
  tagline: string
  targetFilename: string
  locationDescription: string
  language: 'json' | 'toml' | 'bash'
  iconName: 'bot' | 'terminal' | 'cpu'
  sampleTemplate: (connection: ConnectionConfig, selectedModels: Model[]) => string
}
