const router = require('express').Router()
const { nanoid } = require('nanoid')
const { tasks } = require('./mock')
const { reply, updateTask } = require('./utils')

router.get('/tasks', (request, response) => {
  reply(response, tasks)
})

router.post('/task', (request, response) => {
  const body = request.body
  let newTask = null

  if (body) {
    newTask = {
      id: nanoid(),
      name: null,
      creationDate: null,
      dueDate: null,
      order: null,
      status: 'unplanned',
      ...body,
    }

    tasks.push(newTask)
    console.log(`Created new task: ${newTask.id}`)
  }

  reply(response, newTask)
})

router.patch('/task:taskId', (request, response) => {
  const body = request.body
  const taskId = request.params?.taskId
  let updatedTask

  if (taskId) {
    updatedTask = updateTask(taskId, body)
  }

  reply(response, updatedTask)
})

module.exports = router
