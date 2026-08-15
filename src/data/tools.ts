import type { ToolId, ToolMeta, ConnectionConfig, Model } from '../types'

export const tools: Record<ToolId, ToolMeta> = {
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    tagline: 'VS Code chatLanguageModels.json configuration',
    targetFilename: 'chatLanguageModels.json',
    locationDescription: 'VS Code User settings or global profile directory',
    language: 'json',
    iconName: 'bot',
    sampleTemplate: (connection: ConnectionConfig, selectedModels: Model[]) => {
      const activeModels = selectedModels.length > 0 ? selectedModels : [
        {
          id: 'cc/claude-sonnet-4.5',
          name: 'Claude Sonnet 4.5',
          family: 'claude-sonnet-4-5',
          contextWindow: 200000,
          vision: true,
          toolCalling: true,
        }
      ]

      const entries = activeModels.map((m) => ({
        id: `9router-${m.id.replace(/[^a-zA-Z0-9_-]/g, '-')}`,
        name: `${m.name || m.id} (9router)`,
        vendor: 'customoai',
        family: m.family || m.id.split('/').pop() || 'custom',
        version: '1.0.0',
        maxInputTokens: m.contextWindow || 128000,
        maxOutputTokens: 8192,
        endpoint: connection.baseUrl.replace(/\/+$/, '') + '/chat/completions',
        apiKey: connection.apiKey ? connection.apiKey : '${input:9router-api-key}',
        model: m.id,
        toolCalling: m.toolCalling ?? true,
        vision: m.vision ?? true,
      }))

      return JSON.stringify(entries, null, 2)
    },
  },
  'claude-code': {
    id: 'claude-code',
    name: 'Claude Code',
    tagline: 'Anthropic CLI ~/.claude/config.json',
    targetFilename: 'config.json',
    locationDescription: '~/.claude/config.json or environment variables',
    language: 'json',
    iconName: 'terminal',
    sampleTemplate: (connection: ConnectionConfig, selectedModels: Model[]) => {
      const primaryModel = selectedModels[0]?.id || 'cc/claude-sonnet-4.5'
      const configObj = {
        anthropic_api_base: connection.baseUrl.replace(/\/+$/, ''),
        anthropic_api_key: connection.apiKey || 'sk-9router-local-key',
        model: primaryModel,
        verbose: false,
      }

      const envNotice = `// Target: ~/.claude/config.json\n// Alternative environment variables:\n// export ANTHROPIC_BASE_URL="${connection.baseUrl}"\n// export ANTHROPIC_AUTH_TOKEN="${connection.apiKey || 'sk-9router-local-key'}"\n// export ANTHROPIC_MODEL="${primaryModel}"\n\n`
      return envNotice + JSON.stringify(configObj, null, 2)
    },
  },
  codex: {
    id: 'codex',
    name: 'Codex CLI',
    tagline: 'Codex CLI ~/.codex/config.toml configuration',
    targetFilename: 'config.toml',
    locationDescription: '~/.codex/config.toml',
    language: 'toml',
    iconName: 'cpu',
    sampleTemplate: (connection: ConnectionConfig, selectedModels: Model[]) => {
      const primaryModel = selectedModels[0]?.id || 'openai/gpt-4o'
      const apiKeyVal = connection.apiKey || '9ROUTER_API_KEY'
      return `# ~/.codex/config.toml
model_provider = "9router"
model = "${primaryModel}"
temperature = 0.2

[model_providers.9router]
name = "9router Local Gateway"
base_url = "${connection.baseUrl.replace(/\/+$/, '')}"
env_key = "${apiKeyVal}"
wire_format = "openai"
`
    },
  },
}

export const toolList: ToolMeta[] = [
  tools.copilot,
  tools['claude-code'],
  tools.codex,
]
