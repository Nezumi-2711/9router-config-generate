const MAX_REQUEST_BODY_BYTES = 10_240
const MAX_BASE_URL_LENGTH = 2_048
const MAX_API_KEY_LENGTH = 4_096

interface ModelProxyEnvironment {
  MODEL_PROXY_ALLOWED_ORIGINS?: string
}

interface ModelProxyRequestBody {
  baseUrl?: unknown
  apiKey?: unknown
}

function jsonError(status: number, error: string): Response {
  return Response.json(
    { error },
    {
      status,
      headers: { 'cache-control': 'no-store' },
    }
  )
}

function getAllowedOrigins(value: string | undefined): Set<string> {
  const origins = new Set<string>()

  for (const candidate of value?.split(',') ?? []) {
    try {
      const url = new URL(candidate.trim())
      if (
        url.protocol === 'https:' &&
        url.pathname === '/' &&
        !url.search &&
        !url.hash &&
        !url.username &&
        !url.password
      ) {
        origins.add(url.origin)
      }
    } catch {
      // Ignore malformed configuration entries rather than widening access.
    }
  }

  return origins
}

export async function proxyModelRequest(
  request: Request,
  env: ModelProxyEnvironment
): Promise<Response> {
  if (request.method !== 'POST') {
    return jsonError(405, 'Method not allowed')
  }

  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
    return jsonError(413, 'Request body is too large')
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonError(415, 'Content-Type must be application/json')
  }

  const requestText = await request.text()
  if (requestText.length > MAX_REQUEST_BODY_BYTES) {
    return jsonError(413, 'Request body is too large')
  }

  let body: ModelProxyRequestBody
  try {
    body = JSON.parse(requestText) as ModelProxyRequestBody
  } catch {
    return jsonError(400, 'Request body must be valid JSON')
  }

  if (
    typeof body.baseUrl !== 'string' ||
    body.baseUrl.length === 0 ||
    body.baseUrl.length > MAX_BASE_URL_LENGTH
  ) {
    return jsonError(400, 'baseUrl must be a valid HTTPS URL')
  }

  if (typeof body.apiKey !== 'undefined' && typeof body.apiKey !== 'string') {
    return jsonError(400, 'apiKey must be a string')
  }

  if (body.apiKey && body.apiKey.length > MAX_API_KEY_LENGTH) {
    return jsonError(400, 'apiKey is too long')
  }

  const normalizedBaseUrl = body.baseUrl.trim().replace(/\/+$/, '')
  let baseUrl: URL
  try {
    baseUrl = new URL(normalizedBaseUrl)
  } catch {
    return jsonError(400, 'baseUrl must be a valid HTTPS URL')
  }

  if (
    baseUrl.protocol !== 'https:' ||
    baseUrl.username ||
    baseUrl.password ||
    baseUrl.search ||
    baseUrl.hash
  ) {
    return jsonError(400, 'baseUrl must be a valid HTTPS URL')
  }

  const allowedOrigins = getAllowedOrigins(env.MODEL_PROXY_ALLOWED_ORIGINS)
  if (allowedOrigins.size === 0) {
    return jsonError(
      503,
      'Model proxy is not configured. Ask the site administrator to configure MODEL_PROXY_ALLOWED_ORIGINS.'
    )
  }

  if (!allowedOrigins.has(baseUrl.origin)) {
    return jsonError(403, 'This gateway origin is not allowed by the model proxy')
  }

  const headers = new Headers({ Accept: 'application/json' })
  if (body.apiKey?.trim()) {
    headers.set('Authorization', `Bearer ${body.apiKey.trim()}`)
  }

  let upstreamResponse: Response
  try {
    upstreamResponse = await fetch(`${normalizedBaseUrl}/models`, {
      method: 'GET',
      headers,
      redirect: 'error',
    })
  } catch {
    return jsonError(502, 'Unable to contact the configured gateway')
  }

  const upstreamBody = await upstreamResponse.json().catch(() => ({
    error: 'Gateway returned an invalid JSON response',
  }))

  return Response.json(upstreamBody, {
    status: upstreamResponse.status,
    headers: { 'cache-control': 'no-store' },
  })
}