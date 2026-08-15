import { tools } from '../data/tools.ts'
import type { ConnectionConfig, Model } from '../types.ts'
import { decodeInstallToken, type MinimalModel } from './installLink.ts'
import { buildInstallScript } from './installScript.ts'

export interface RenderInstallScriptResult {
  status: number
  contentType: string
  body: string
}

export function renderInstallScript(
  token: string,
  ext: 'sh' | 'ps1'
): RenderInstallScriptResult {
  const isUnix = ext === 'sh'
  const contentType = isUnix
    ? 'text/x-shellscript; charset=utf-8'
    : 'text/plain; charset=utf-8'

  const payload = decodeInstallToken(token)
  if (!payload) {
    return {
      status: 400,
      contentType,
      body: '# Invalid install link\n',
    }
  }

  const tool = tools[payload.t]
  if (!tool || !tool.installTargets) {
    return {
      status: 400,
      contentType,
      body: '# Tool not found or install script not supported\n',
    }
  }

  const connection: ConnectionConfig = {
    baseUrl: payload.b,
    apiKey: '__NINEROUTER_API_KEY__',
  }

  const models: Model[] = (payload.m || []).map((m: MinimalModel) => ({
    id: m.id,
    name: m.name || m.id,
    provider: m.provider,
    contextWindow: m.contextWindow,
    vision: m.vision,
    toolCalling: m.toolCalling,
    reasoning: m.reasoning,
    family: m.family,
  }))

  const script = buildInstallScript(
    tool,
    connection,
    models,
    isUnix ? 'unix' : 'windows',
    { keySource: 'runtime-env' }
  )

  if (!script) {
    return {
      status: 500,
      contentType,
      body: '# Failed to generate install script\n',
    }
  }

  return {
    status: 200,
    contentType,
    body: script.content,
  }
}
