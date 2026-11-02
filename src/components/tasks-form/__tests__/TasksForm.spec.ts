import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import TasksForm from '../TasksForm.vue'
import { useTasksStore } from '../../../stores/tasks'
import * as api from '../../../api/tasks'

vi.mock('../../../api/tasks')

const mockApi = vi.mocked(api)

describe('TasksForm', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  function mountForm() {
    return mount(TasksForm, { global: { plugins: [pinia] } })
  }

  it('очищает input после создания задачи', async () => {
    mockApi.createTask.mockResolvedValue({
      id: 'server-id',
      name: 'New task',
      creationDate: '2026-11-01',
      dueDate: null,
      order: null,
      completed: false,
    })

    const wrapper = mountForm()
    const input = wrapper.find('input[type="text"]')

    await input.setValue('New task')
    await input.trigger('keydown', { key: 'Enter' })

    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('вызывает store.createTask при Enter', async () => {
    mockApi.createTask.mockResolvedValue({
      id: 'server-id',
      name: 'New task',
      creationDate: '2026-11-01',
      dueDate: null,
      order: null,
      completed: false,
    })

    const store = useTasksStore()
    const spy = vi.spyOn(store, 'createTask')

    const wrapper = mountForm()
    const input = wrapper.find('input[type="text"]')

    await input.setValue('New task')
    await input.trigger('keydown', { key: 'Enter' })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New task',
      }),
    )
  })

  it('не создаёт задачу при пустом input', async () => {
    const store = useTasksStore()
    const spy = vi.spyOn(store, 'createTask')

    const wrapper = mountForm()
    const input = wrapper.find('input[type="text"]')

    await input.setValue('   ')
    await input.trigger('keydown', { key: 'Enter' })

    expect(spy).not.toHaveBeenCalled()
  })

  it('переключает minimized при клике на кнопку', async () => {
    const wrapper = mountForm()

    expect(wrapper.classes()).not.toContain('minimized')

    await wrapper.find('.header button').trigger('click')
    expect(wrapper.classes()).toContain('minimized')

    await wrapper.find('.header button').trigger('click')
    expect(wrapper.classes()).not.toContain('minimized')
  })

  it('скрывает контент при minimized', async () => {
    const wrapper = mountForm()

    await wrapper.find('.header button').trigger('click')

    expect(wrapper.find('h1').exists()).toBe(false)
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
  })
})
