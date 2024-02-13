const reply = (response, body, timeout = 1000, status = 200) =>
  setTimeout(() => {
    response.status(status).json(body)
  }, timeout)

const getById = (entities) => (id) =>
  entities.find((entity) => entity.id === id)

const updateById = (entities) => (id, data) => {
  const index = entities.findIndex((entity) => entity.id === id)

  entities[index] = { ...entities[index], ...data }

  if (typeof data.order === 'number' && data.dueDate) {
    const updatedEntities = [entities[index]]

    entities.forEach(entity => {
      if (entity.id !== id && (entity.dueDate === data.dueDate) && entity.order >= data.order) {
        entity.order = entity.order + 1

        updatedEntities.push(entity)
      }
    })

    return updatedEntities.length > 1 ? updatedEntities : entities[index]
  }

  return entities[index]
}

module.exports = {
  reply,
  getById,
  updateById
}
