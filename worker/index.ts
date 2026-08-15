import { renderInstallScript } from '../src/services/installEndpoint.ts'

interface WorkerEnv {
  ASSETS: {
    fetch(request: Request): Promise<Response>
  }
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url)
    const m = url.pathname.match(/^\/i\/([A-Za-z0-9\-_]+)\.(sh|ps1)$/)
    if (m) {
      const { status, contentType, body } = renderInstallScript(
        m[1],
        m[2] as 'sh' | 'ps1'
      )
      return new Response(body, {
        status,
        headers: {
          'content-type': contentType,
          'cache-control': 'no-store',
        },
      })
    }

    return env.ASSETS.fetch(request)
  },
}
