import type { ToolId, ToolMeta, ConnectionConfig, Model } from '../types.ts'

export const tools: Record<ToolId, ToolMeta> = {
  copilot: {
    id: 'copilot',
    name: 'GitHub Copilot',
    tagline: 'VS Code chatLanguageModels.json customendpoint configuration',
    targetFilename: 'chatLanguageModels.json',
    locationDescription: 'VS Code Command Palette → "Chat: Manage Language Models" → Add Models → Custom Endpoint',
    language: 'json',
    iconName: 'bot',
    installTargets: {
      unixPath: '$HOME/.config/Code/User/chatLanguageModels.json',
      windowsPath: '$env:APPDATA\\Code\\User\\chatLanguageModels.json',
    },
    sampleTemplate: (connection: ConnectionConfig, selectedModels: Model[]) => {
      const activeModels = selectedModels.length > 0 ? selectedModels : [
        {
          id: 'cc/claude-sonnet-4.5',
          name: 'Claude Sonnet 4.5',
          family: 'claude-sonnet-4-5',
          provider: 'Anthropic',
          contextWindow: 200000,
          vision: true,
          toolCalling: true,
        }
      ]

      // Group models by provider
      const groupsMap = new Map<string, Model[]>()
      for (const m of activeModels) {
        const provider = m.provider || (m.id.includes('/') ? m.id.split('/')[0] : '9router')
        if (!groupsMap.has(provider)) {
          groupsMap.set(provider, [])
        }
        groupsMap.get(provider)!.push(m)
      }

      const endpointUrl = connection.baseUrl.replace(/\/+$/, '') + '/chat/completions'
      const apiKeyVal = connection.apiKey ? connection.apiKey : '${input:9router-api-key}'

      const groups = Array.from(groupsMap.entries()).map(([provider, models]) => {
        return {
          name: `9router · ${provider}`,
          vendor: 'customendpoint',
          apiKey: apiKeyVal,
          apiType: 'chat-completions',
          models: models.map((m) => {
            const modelObj: Record<string, unknown> = {
              id: m.id,
              name: m.name || m.id,
              url: endpointUrl,
              toolCalling: m.toolCalling ?? true,
              vision: m.vision ?? true,
              maxInputTokens: m.contextWindow || 128000,
              // Guidance: maxInputTokens + maxOutputTokens <= context window
              maxOutputTokens: 16384,
            }

            if (m.reasoning) {
              modelObj.thinking = true
              modelObj.supportsReasoningEffort = ['low', 'medium', 'high']
              modelObj.reasoningEffortFormat = 'chat-completions'
            }

            return modelObj
          }),
        }
      })

      return JSON.stringify(groups, null, 2)
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
