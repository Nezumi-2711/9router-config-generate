import { describe, it, expect } from 'bun:test'
import { encodeInstallToken, decodeInstallToken, buildOneClickCommand } from './installLink'
import { renderInstallScript } from './installEndpoint'
import { tools } from '../data/tools'

describe('Install Link & Endpoint', () => {
  it('encodes and decodes install token correctly', () => {
    const payload = {
      v: 1 as const,
      t: 'copilot' as const,
      b: 'http://localhost:20128/v1',
      m: [
        { id: 'cc/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' },
        { id: 'gemini/gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      ],
    }

    const token = encodeInstallToken(payload)
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)

    const decoded = decodeInstallToken(token)
    expect(decoded).toEqual(payload)
  })

  it('builds one-click commands without exposing an API key', () => {
    const cmdUnix = buildOneClickCommand(
      tools.copilot,
      { baseUrl: 'http://localhost:20128/v1', apiKey: 'sk-test-key-123' },
      [{ id: 'cc/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' }],
      'unix',
      'https://9router.example.com'
    )

    expect(cmdUnix).toContain('curl -fsSL "https://9router.example.com/i/')
    expect(cmdUnix).toContain('.sh" | bash')
    expect(cmdUnix).not.toContain('sk-test-key-123')

    const cmdWin = buildOneClickCommand(
      tools.copilot,
      { baseUrl: 'http://localhost:20128/v1', apiKey: 'sk-test-key-123' },
      [{ id: 'cc/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' }],
      'windows',
      'https://9router.example.com'
    )

    expect(cmdWin).toContain('irm "https://9router.example.com/i/')
    expect(cmdWin).toContain('.ps1" | iex')
    expect(cmdWin).not.toContain('sk-test-key-123')
  })

  it('renders install script endpoint output', () => {
    const token = encodeInstallToken({
      v: 1,
      t: 'copilot',
      b: 'http://localhost:20128/v1',
      m: [{ id: 'cc/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' }],
    })

    const shRes = renderInstallScript(token, 'sh')
    expect(shRes.status).toBe(200)
    expect(shRes.contentType).toContain('text/x-shellscript')
    expect(shRes.body).toContain('__NINEROUTER_API_KEY__')
    expect(shRes.body).toContain('NINEROUTER_API_KEY')

    const ps1Res = renderInstallScript(token, 'ps1')
    expect(ps1Res.status).toBe(200)
    expect(ps1Res.contentType).toContain('text/plain')
    expect(ps1Res.body).toContain('__NINEROUTER_API_KEY__')
  })

  it('replaces every API key placeholder in generated runtime scripts', () => {
    const token = encodeInstallToken({
      v: 1,
      t: 'copilot',
      b: 'http://localhost:20128/v1',
      m: [{ id: 'cc/claude-sonnet-4.5', name: 'Claude Sonnet 4.5' }],
    })

    const res = renderInstallScript(token, 'sh')
    expect(res.status).toBe(200)
    expect(res.body).toContain('replace_api_key_placeholder')
    expect(res.body).toContain('while [[ "$CONFIG" == *"$API_KEY_PLACEHOLDER"* ]]')
  })

  it('handles invalid token gracefully', () => {
    const res = renderInstallScript('invalid-token', 'sh')
    expect(res.status).toBe(400)
    expect(res.body).toContain('# Invalid install link')
  })
})
