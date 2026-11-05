import { Hono } from 'hono'
import { cors } from 'hono/cors'
import taskRoutes from './routes/tasks.js'
import { errorHandler } from './middleware/error-handler.js'

const app = new Hono()

app.use('*', cors())
app.use('*', errorHandler)

app.route('/api', taskRoutes)

export default app
