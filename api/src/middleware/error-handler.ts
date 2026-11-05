import type { Context, Next } from 'hono'
import { ZodError } from 'zod'

export async function errorHandler(c: Context, next: Next) {
  try {
    await next()
  } catch (err) {
    if (err instanceof ZodError) {
      return c.json(
        { error: 'Validation failed', details: err.issues },
        400,
      )
    }

    console.error('Unhandled error:', err)
    return c.json({ error: 'Internal server error' }, 500)
  }
}
