import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repoRoot = path.dirname(fileURLToPath(import.meta.url))
// @ts-expect-error local dev plugin has no generated types
import { experimentSetOneSavesPlugin } from './scripts/experiment-set-one-saves-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(repoRoot, 'src'),
    },
  },
  plugins: [
    react(),
    experimentSetOneSavesPlugin(),
    {
      name: 'raw-reference-lab-index',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/raw-reference-lab' || req.url === '/raw-reference-lab/') {
            req.url = '/raw-reference-lab/index.html'
          }
          next()
        })
      },
    },
  ],
})
