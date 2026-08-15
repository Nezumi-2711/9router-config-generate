import { afterEach, describe, expect, it, mock } from 'bun:test'
import { proxyModelRequest } from './modelProxy.ts'

const originalFetch = globalThis.fetch

function createRequest(body: Record<string, unknown>, method = 'POST'): Request {
  return new Request('https://config.example.com/api/fetch-models', {
    method,
    headers: { 'content-type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })
}

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('model proxy', () => {
  it('does not enable the proxy without an allowlist', async () => {
    const fetchMock = mock()
    globalThis.fetch = fetchMock

    const response = await proxyModelRequest(
      createRequest({ baseUrl: 'https://router.example.com/v1' }),
      {}
    )

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ignores allowlist entries that are not plain HTTPS origins', async () => {
    const fetchMock = mock()
    globalThis.fetch = fetchMock

    const response = await proxyModelRequest(
      createRequest({ baseUrl: 'https://router.example.com/v1' }),
      { MODEL_PROXY_ALLOWED_ORIGINS: 'https://router.example.com/v1' }
    )

    expect(response.status).toBe(503)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('proxies an allowlisted gateway request with a bearer token', async () => {
    const fetchMock = mock(() =>
      Promise.resolve(Response.json({ data: [{ id: 'example-model' }] }))
    )
    globalThis.fetch = fetchMock

    const response = await proxyModelRequest(
      createRequest({
        baseUrl: 'https://router.example.com/v1/',
        apiKey: 'test-key',
      }),
      { MODEL_PROXY_ALLOWED_ORIGINS: 'https://router.example.com' }
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [{ id: 'example-model' }] })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://router.example.com/v1/models',
      expect.objectContaining({
        headers: expect.any(Headers),
        redirect: 'error',
      })
    )

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((requestInit.headers as Headers).get('Authorization')).toBe('Bearer test-key')
  })

  it('rejects unallowlisted and non-HTTPS gateways without fetching them', async () => {
    const fetchMock = mock()
    globalThis.fetch = fetchMock
    const env = { MODEL_PROXY_ALLOWED_ORIGINS: 'https://router.example.com' }

    const unallowlisted = await proxyModelRequest(
      createRequest({ baseUrl: 'https://other.example.com/v1' }),
      env
    )
    const nonHttps = await proxyModelRequest(
      createRequest({ baseUrl: 'http://router.example.com/v1' }),
      env
    )

    expect(unallowlisted.status).toBe(403)
    expect(nonHttps.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})