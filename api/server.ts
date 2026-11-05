import { serve } from '@hono/node-server'
import app from './src/index.js'

const port = 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`API server running on http://localhost:${port}`)
})
