import { describe, it, expect, vi, beforeEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TaskItem from '../TaskItem.vue'
import { useTaskStore } from '../../../stores/task'
import type { Task } from '../../../types/tasks'

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: '1',
    name: 'Test task',
    creationDate: '2026-11-01',
    dueDate: null,
    order: null,
    completed: false,
    ...overrides,
  }
}

describe('TaskItem', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('рендерит задачу с правильным текстом', () => {
    const store = useTaskStore()
    const task = makeTask({ name: 'My task' })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.text').text()).toBe('My task')
  })

  it('добавляет класс completed для завершённой задачи', () => {
    const store = useTaskStore()
    const task = makeTask({ completed: true })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').classes()).toContain('completed')
  })

  it('не добавляет класс completed для незавершённой задачи', () => {
    const store = useTaskStore()
    const task = makeTask({ completed: false })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').classes()).not.toContain('completed')
  })

  it('добавляет класс overdue для просроченной задачи', () => {
    const store = useTaskStore()
    const yesterday = new Date()

    yesterday.setDate(yesterday.getDate() - 1)
    const task = makeTask({
      completed: false,
      dueDate: yesterday.toISOString().split('T')[0],
    })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').classes()).toContain('overdue')
  })

  it('не добавляет класс overdue для завершённой просроченной задачи', () => {
    const store = useTaskStore()
    const yesterday = new Date()

    yesterday.setDate(yesterday.getDate() - 1)
    const task = makeTask({
      completed: true,
      dueDate: yesterday.toISOString().split('T')[0],
    })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').classes()).not.toContain('overdue')
  })

  it('не добавляет класс overdue для задачи со сроком сегодня', () => {
    const store = useTaskStore()
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const task = makeTask({
      completed: false,
      dueDate: today,
    })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').classes()).not.toContain('overdue')
  })

  it('draggable=false для завершённой задачи', () => {
    const store = useTaskStore()
    const task = makeTask({ completed: true })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').attributes('draggable')).toBe('false')
  })

  it('draggable=true для незавершённой задачи', () => {
    const store = useTaskStore()
    const task = makeTask({ completed: false })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('.task').attributes('draggable')).toBe('true')
  })

  it('устанавливает data-task-id на корневой элемент', () => {
    const store = useTaskStore()
    const task = makeTask({ id: 'task-42' })

    store.entities[task.id] = task
    store.ids = [task.id]

    const wrapper = shallowMount(TaskItem, {
      props: { taskId: task.id },
    })

    expect(wrapper.find('[data-task]').attributes('data-task-id')).toBe('task-42')
  })
})
