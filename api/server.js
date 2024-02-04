const express = require('express')
const api = require('./src')
const bodyParser = require('body-parser')
const port = 3001

const app = express()

app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', '*')
  response.header('Access-Control-Allow-Methods', '*')
  response.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})
app.use(bodyParser.json())
app.use('/api', api)

app.listen(port, 'localhost', error => {
  if (error) {
    console.log(error)
    return
  }
  console.log(`Listening at http://localhost: ${port}`)
})
