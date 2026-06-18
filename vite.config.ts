import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// @ts-expect-error local dev plugin has no generated types
import { experimentSetOneSavesPlugin } from './scripts/experiment-set-one-saves-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
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
