import type { ConnectionConfig, Model } from '../types'

interface RawModelCapability {
  vision?: boolean
  tools?: boolean
  reasoning?: boolean
  contextWindow?: number
  maxOutput?: number
  [key: string]: unknown
}

interface RawModelResponseItem {
  id: string
  object?: string
  owned_by?: string
  name?: string
  capabilities?: RawModelCapability
  context_length?: number
  max_completion_tokens?: number
  description?: string
  [key: string]: unknown
}

interface RawModelsResponse {
  data?: RawModelResponseItem[]
  object?: string
}

function parseProvider(id: string, ownedBy?: string): string {
  if (ownedBy) {
    if (ownedBy === 'cx') return 'Codex / OpenAI'
    if (ownedBy === 'ag') return 'Antigravity / Google'
    if (ownedBy === 'anthropic' || ownedBy === 'cc') return 'Anthropic'
    if (ownedBy === 'openai') return 'OpenAI'
    return ownedBy.toUpperCase()
  }

  const prefix = id.split('/')[0]?.toLowerCase()
  if (prefix === 'cx') return 'Codex'
  if (prefix === 'ag') return 'Antigravity'
  if (prefix === 'cc') return 'Anthropic'
  if (prefix === 'openai') return 'OpenAI'
  if (prefix === 'vertex') return 'Google Vertex'
  if (prefix === 'deepseek') return 'DeepSeek'
  return prefix ? prefix.toUpperCase() : 'Custom'
}

function formatModelName(id: string, rawName?: string): string {
  if (rawName && rawName !== id) return rawName

  // Remove prefix if present, e.g. "cx/gpt-5.6-sol" -> "gpt-5.6-sol"
  const cleanId = id.includes('/') ? id.split('/').slice(1).join('/') : id
  
  return cleanId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function fetchRemoteModels(connection: ConnectionConfig): Promise<Model[]> {
  const trimmedBase = connection.baseUrl.replace(/\/+$/, '')
  const isHttpUrl = trimmedBase.startsWith('http://') || trimmedBase.startsWith('https://')

  let data: RawModelsResponse | null = null

  // 1. Direct fetch with the standard Authorization header. Never put an API key in a URL.
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (connection.apiKey?.trim()) {
      headers['Authorization'] = `Bearer ${connection.apiKey.trim()}`
    }

    const directRes = await fetch(`${trimmedBase}/models`, {
      method: 'GET',
      headers,
    })

    if (directRes.ok) {
      data = await directRes.json()
    }
  } catch {
    // If direct CORS/network fails, fallback to standard Authorization header or proxy
  }

  // 2. Fallback to the local Vite / allowlisted Worker proxy when direct CORS fails.
  if (!data && isHttpUrl) {
    try {
      const proxyRes = await fetch('/api/fetch-models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseUrl: connection.baseUrl,
          apiKey: connection.apiKey,
        }),
      })

      if (proxyRes.ok) {
        data = await proxyRes.json()
      } else {
        const errJson = await proxyRes.json().catch(() => null)
        const errMsg = errJson?.error?.message || errJson?.error || proxyRes.statusText
        throw new Error(`Failed to fetch models: ${errMsg}`)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw err
      }
    }
  }

  if (!data) {
    throw new Error('Unable to connect to gateway models endpoint. Check your Base URL and API Key.')
  }

  const rawList = Array.isArray(data) ? data : (data.data || [])

  return rawList.map((item) => {
    const caps = item.capabilities || {}
    const contextWindow =
      caps.contextWindow ||
      item.context_length ||
      (item.contextWindow as number) ||
      undefined

    const vision = caps.vision ?? (item.vision as boolean | undefined) ?? false
    const toolCalling = caps.tools ?? caps.toolCalling ?? (item.toolCalling as boolean | undefined) ?? false
    const reasoning = caps.reasoning ?? (item.reasoning as boolean | undefined) ?? false

    return {
      id: item.id,
      name: item.name || formatModelName(item.id),
      provider: parseProvider(item.id, item.owned_by),
      family: item.id.split('/').pop()?.replace(/[^a-zA-Z0-9_-]/g, '-'),
      contextWindow,
      vision,
      toolCalling,
      reasoning,
      description: item.description || (caps.reasoning ? 'Reasoning model with extended thinking capabilities' : undefined),
    }
  })
}
