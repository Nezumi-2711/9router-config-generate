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
      name: 'install-script-middleware',
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

      },
    },
  ],
})
