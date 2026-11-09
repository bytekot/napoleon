import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { DndScope } from '../../../composables/dnd'
import TaskList from '../../tasks/TaskList.vue'
import { useTaskStore } from '../../../stores/task'
import * as api from '../../../api/tasks'
import type { Task } from '../../../types/tasks'

vi.mock('../../../api/tasks')

const mockApi = vi.mocked(api)

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
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockApi.editTasks.mockResolvedValue([])
  })

  afterEach(() => {
    wrapper.unmount()
  })

  function mountTaskItem(task: Task) {
    const store = useTaskStore()

    store.entities[task.id] = task
    store.ids = [task.id]

    const TestWrapper = defineComponent({
      components: { DndScope, TaskList },
      setup() {
        return () => h(DndScope, null, () => h(TaskList, { dueDate: task.dueDate }))
      },
    })

    wrapper = mount(TestWrapper, { attachTo: document.body })

    return wrapper
  }

  it('рендерит задачу с правильным текстом', () => {
    const task = makeTask({ name: 'My task' })
    const w = mountTaskItem(task)

    expect(w.find('.text').text()).toBe('My task')
  })

  it('добавляет класс completed для завершённой задачи', () => {
    const task = makeTask({ completed: true })
    const w = mountTaskItem(task)

    expect(w.find('.task').classes()).toContain('completed')
  })

  it('не добавляет класс completed для незавершённой задачи', () => {
    const task = makeTask({ completed: false })
    const w = mountTaskItem(task)

    expect(w.find('.task').classes()).not.toContain('completed')
  })

  it('добавляет класс overdue для просроченной задачи', () => {
    const yesterday = new Date()

    yesterday.setDate(yesterday.getDate() - 1)
    const task = makeTask({
      completed: false,
      dueDate: yesterday.toISOString().split('T')[0],
    })
    const w = mountTaskItem(task)

    expect(w.find('.task').classes()).toContain('overdue')
  })

  it('не добавляет класс overdue для завершённой просроченной задачи', () => {
    const yesterday = new Date()

    yesterday.setDate(yesterday.getDate() - 1)
    const task = makeTask({
      completed: true,
      dueDate: yesterday.toISOString().split('T')[0],
    })
    const w = mountTaskItem(task)

    expect(w.find('.task').classes()).not.toContain('overdue')
  })

  it('не добавляет класс overdue для задачи со сроком сегодня', () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const task = makeTask({
      completed: false,
      dueDate: today,
    })
    const w = mountTaskItem(task)

    expect(w.find('.task').classes()).not.toContain('overdue')
  })

  it('устанавливает data-task-id на корневой элемент', () => {
    const task = makeTask({ id: 'task-42' })
    const w = mountTaskItem(task)

    expect(w.find('[data-task]').attributes('data-task-id')).toBe('task-42')
  })

  it('переключает выполнение при клике по карточке', async () => {
    const task = makeTask({ completed: false })
    const store = useTaskStore()
    const spy = vi.spyOn(store, 'editTask')
    const w = mountTaskItem(task)

    await w.find('[data-task]').trigger('click')

    expect(spy).toHaveBeenCalledWith({ id: task.id, completed: true })
  })

  it('устанавливает aria-label на чекбокс из имени задачи', () => {
    const task = makeTask({ name: 'Buy milk' })
    const w = mountTaskItem(task)

    expect(w.find('input[type="checkbox"]').attributes('aria-label')).toBe('Buy milk')
  })
})
