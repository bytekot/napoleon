import { Hono } from 'hono'
import { cors } from 'hono/cors'
import taskRoutes from './routes/tasks.js'
import { ZodError } from 'zod'

const app = new Hono()

app.use('*', cors())

app.route('/api', taskRoutes)

app.onError((err, c) => {
  if (err instanceof ZodError) {
    return c.json(
      { error: 'Validation failed', details: err.issues },
      400,
    )
  }

  console.error('Unhandled error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

export default app
