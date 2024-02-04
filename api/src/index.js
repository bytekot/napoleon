const router = require('express').Router()
const { nanoid } = require('nanoid')
const { tasks } = require('./mock')
const { reply, updateById } = require('./utils')

router.get('/tasks', (request, response) => {
  reply(response, tasks)
})

router.post('/task', (request, response) => {
  const body = request.body
  let newTask = null

  if (body) {
    newTask = {
      ...body,
      id: nanoid(),
    }

    tasks.push(newTask)
  }

  reply(response, newTask)
})

router.patch('/task:taskId', (request, response) => {
  const body = request.body
  const taskId = request.params?.taskId
  let updatedTask

  if (taskId) {
    updatedTask = updateById(tasks)(taskId, body)
  }

  reply(response, updatedTask)
})

module.exports = router
