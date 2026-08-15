import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { renderInstallScript } from './src/services/installEndpoint.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    {
      name: 'router-proxy-middleware',
      configureServer(server) {
        // Dev endpoint for 1-click install scripts: /i/:token.(sh|ps1)
        server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
          const url = req.url || ''
          const m = url.match(/^\/i\/([A-Za-z0-9\-_]+)\.(sh|ps1)(?:\?.*)?$/)
          if (m && req.method === 'GET') {
            const { status, contentType, body } = renderInstallScript(
              m[1],
              m[2] as 'sh' | 'ps1'
            )
            res.statusCode = status
            res.setHeader('Content-Type', contentType)
            res.setHeader('Cache-Control', 'no-store')
            res.end(body)
            return
          }
          next()
        })

        server.middlewares.use('/api/fetch-models', async (req: IncomingMessage, res: ServerResponse) => {
          if (req.method !== 'POST') {
            res.statusCode = 405
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          let body = ''
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
          })

          req.on('end', async () => {
            try {
              const { baseUrl, apiKey } = JSON.parse(body || '{}')
              if (!baseUrl) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'baseUrl is required' }))
                return
              }

              const targetUrl = `${baseUrl.replace(/\/+$/, '')}/models`
              const headers: Record<string, string> = {
                'Accept': 'application/json',
              }
              if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey.trim()}`
              }

              const remoteRes = await fetch(targetUrl, {
                method: 'GET',
                headers,
              })

              const remoteData = await remoteRes.json().catch(() => null)

              res.statusCode = remoteRes.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(remoteData || {}))
            } catch (err: unknown) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              const msg = err instanceof Error ? err.message : 'Internal error'
              res.end(JSON.stringify({ error: msg }))
            }
          })
        })
      },
    },
  ],
})
