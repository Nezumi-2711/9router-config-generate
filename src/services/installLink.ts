import type { ToolId, ToolMeta, ConnectionConfig, Model } from '../types.ts'
import { type ScriptOS } from './installScript.ts'

export interface MinimalModel {
  id: string
  name?: string
  provider?: string
  contextWindow?: number
  vision?: boolean
  toolCalling?: boolean
  reasoning?: boolean
  family?: string
}

export interface InstallTokenPayload {
  v: 1
  t: ToolId
  b: string
  m: MinimalModel[]
}

/**
 * Base64URL encode a string (UTF-8 safe)
 */
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/**
 * Base64URL decode a string to Uint8Array (UTF-8 safe)
 */
function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function encodeInstallToken(payload: InstallTokenPayload): string {
  const jsonStr = JSON.stringify(payload)
  const encoder = new TextEncoder()
  const bytes = encoder.encode(jsonStr)
  return bytesToBase64Url(bytes)
}

export function decodeInstallToken(token: string): InstallTokenPayload | null {
  try {
    const bytes = base64UrlToBytes(token)
    const decoder = new TextDecoder()
    const jsonStr = decoder.decode(bytes)
    const payload = JSON.parse(jsonStr) as InstallTokenPayload
    if (payload && payload.v === 1 && payload.t && payload.b) {
      return payload
    }
    return null
  } catch {
    return null
  }
}

export function buildOneClickCommand(
  tool: ToolMeta,
  connection: ConnectionConfig,
  models: Model[],
  os: ScriptOS,
  origin: string
): string {
  const minimalModels: MinimalModel[] = models.map((m) => ({
    id: m.id,
    ...(m.name ? { name: m.name } : {}),
    ...(m.provider ? { provider: m.provider } : {}),
    ...(m.contextWindow ? { contextWindow: m.contextWindow } : {}),
    ...(m.vision !== undefined ? { vision: m.vision } : {}),
    ...(m.toolCalling !== undefined ? { toolCalling: m.toolCalling } : {}),
    ...(m.reasoning !== undefined ? { reasoning: m.reasoning } : {}),
    ...(m.family ? { family: m.family } : {}),
  }))

  const token = encodeInstallToken({
    v: 1,
    t: tool.id,
    b: connection.baseUrl,
    m: minimalModels,
  })

  const baseUrl = origin.replace(/\/+$/, '')

  if (os === 'unix') {
    const scriptUrl = `${baseUrl}/i/${token}.sh`
    return `curl -fsSL "${scriptUrl}" | bash`
  }

  // Windows PowerShell
  const scriptUrl = `${baseUrl}/i/${token}.ps1`
  return `irm "${scriptUrl}" | iex`
}
