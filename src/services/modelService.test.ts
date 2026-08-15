import { describe, it, expect, mock } from 'bun:test'
import { fetchRemoteModels } from './modelService'

describe('fetchRemoteModels', () => {
  it('fetches models using Authorization header when supported', async () => {
    const mockFetch = mock(() => {
      return Promise.resolve(new Response(JSON.stringify({
        data: [{ id: 'cx/gpt-5.6-sol', owned_by: 'cx' }]
      }), { status: 200 }))
    })
    globalThis.fetch = mockFetch as unknown as typeof fetch

    const models = await fetchRemoteModels({
      baseUrl: 'https://gateway.example.com/v1',
      apiKey: 'sk-test-key'
    })

    expect(models.length).toBe(1)
    expect(models[0].id).toBe('cx/gpt-5.6-sol')
    expect(models[0].provider).toBe('Codex / OpenAI')
  })

  it('falls back to key query param when preflight / Authorization header fails with CORS', async () => {
    let callCount = 0
    const mockFetch = mock((url: string | URL | Request) => {
      callCount++
      const urlStr = url.toString()
      if (callCount === 1) {
        // First attempt with Authorization header throws network/CORS TypeError
        return Promise.reject(new TypeError('Failed to fetch'))
      }
      if (urlStr.includes('key=sk-test-key')) {
        return Promise.resolve(new Response(JSON.stringify({
          data: [{ id: 'cx/gpt-5.6-sol', owned_by: 'cx' }]
        }), { status: 200 }))
      }
      return Promise.reject(new Error('Unexpected call'))
    })
    globalThis.fetch = mockFetch as unknown as typeof fetch

    const models = await fetchRemoteModels({
      baseUrl: 'https://gateway.example.com/v1',
      apiKey: 'sk-test-key'
    })

    expect(models.length).toBe(1)
    expect(models[0].id).toBe('cx/gpt-5.6-sol')
    expect(callCount).toBe(2)
  })
})
