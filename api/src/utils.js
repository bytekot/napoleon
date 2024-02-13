const { tasks } = require('./mock')

const reply = (response, body, timeout = 1000, status = 200) =>
  setTimeout(() => {
    response.status(status).json(body)
  }, timeout)

const getById = (entities) => (id) =>
  entities.find((entity) => entity.id === id)

const updateById = (entities) => (id, data) => {
  const index = entities.findIndex((entity) => entity.id === id)

  entities[index] = { ...entities[index], ...data }

  return entities[index]
}

const updateTask = (id, data) => {
  const index = tasks.findIndex((task) => task.id === id)

  if (typeof data.order === 'number' && data.dueDate) {
    const { dueDate, order } = tasks[index]
    const updatedTasks = []

    for (let index = 0; index < tasks.length; index++) {
      const task = tasks[index];

      // Обновляем сам таск
      if (task.id === id) {
        tasks[index] = { ...task, ...data }
        updatedTasks.push(tasks[index])
      }
      // Обновляем таски, которые изменили порядок
      // Если у обновляемого таска изменилась дата
      else if (dueDate !== data.dueDate) {
        // Обновляем порядок тасок по новой дате: сдвигаем те, что теперь дальше по порядку
        if (task.dueDate === data.dueDate && task.order >= data.order) {
          task.order++
          updatedTasks.push(task)
        }
        // Обновляем порядок тасок по прежней дате: сдвигаем те, что были дальше по порядку
        else if (task.dueDate === dueDate && task.order > order) {
          task.order--
          updatedTasks.push(task)
        }
      }
      // Если у обновляемого таска не изменилась дата, обновляем порядок тасок по прежней дате
      else if (dueDate === data.dueDate && dueDate === task.dueDate) {
        // Если таск стал дальше по порядку
        if (order < data.order) {
          // Сдвигаем ближе те, что дальше прежней позиции, но ближе новой
          if (task.order > order && task.order <= data.order) {
            task.order--
            updatedTasks.push(task)
          }
        }
        // Если таск стал раньше по порядку
        else if (order > data.order) {
          // Сдвигаем дальше те, что ближе прежней позиции, но дальше новой
          if (task.order < order && task.order >= data.order) {
            task.order++
            updatedTasks.push(task)
          }
        }
      }
    }

    return updatedTasks
  }

  tasks[index] = { ...tasks[index], ...data }

  return tasks[index]
}

module.exports = {
  reply,
  getById,
  updateById,
  updateTask,
}
