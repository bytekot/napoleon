import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import TaskForm from '../TaskForm.vue'
import { useTaskStore } from '../../../stores/task'
import * as api from '../../../api/tasks'

vi.mock('../../../api/tasks')

const mockApi = vi.mocked(api)

describe('TaskForm', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
  })

  function mountForm() {
    return mount(TaskForm, { global: { plugins: [pinia], stubs: { TaskList: true } } })
  }

  it('очищает textarea после создания задачи', async () => {
    mockApi.createTask.mockResolvedValue({
      id: 'server-id',
      name: 'New task',
      creationDate: '2026-11-01',
      dueDate: null,
      order: null,
      completed: false,
    })

    const wrapper = mountForm()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('New task')
    await textarea.trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect((textarea.element as HTMLTextAreaElement).value).toBe('')
  })

  it('вызывает store.createTask при Ctrl+Enter', async () => {
    mockApi.createTask.mockResolvedValue({
      id: 'server-id',
      name: 'New task',
      creationDate: '2026-11-01',
      dueDate: null,
      order: null,
      completed: false,
    })

    const store = useTaskStore()
    const spy = vi.spyOn(store, 'createTask')

    const wrapper = mountForm()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('New task')
    await textarea.trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New task',
      }),
    )
  })

  it('не создаёт задачу при Ctrl+Enter с пустым textarea', async () => {
    const store = useTaskStore()
    const spy = vi.spyOn(store, 'createTask')

    const wrapper = mountForm()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('   ')
    await textarea.trigger('keydown', { key: 'Enter', ctrlKey: true })

    expect(spy).not.toHaveBeenCalled()
  })

  it('не создаёт задачу при обычном Enter', async () => {
    const store = useTaskStore()
    const spy = vi.spyOn(store, 'createTask')

    const wrapper = mountForm()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('New task')
    await textarea.trigger('keydown', { key: 'Enter' })

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
    expect(wrapper.find('textarea').exists()).toBe(false)
  })

  it('показывает hint когда textarea пустой', () => {
    const wrapper = mountForm()

    expect(wrapper.find('.text-area-hint').exists()).toBe(true)
    expect(wrapper.find('.text-area-hint').text()).toBe('Ctrl+Enter ↵')
  })

  it('не скрывает hint при фокусе по умолчанию', async () => {
    const wrapper = mountForm()
    const textarea = wrapper.find('textarea')

    await textarea.trigger('focus')

    expect(wrapper.find('.text-area-hint').exists()).toBe(true)
  })

  it('скрывает hint при наличии текста', async () => {
    const wrapper = mountForm()
    const textarea = wrapper.find('textarea')

    await textarea.setValue('some text')

    expect(wrapper.find('.text-area-hint').exists()).toBe(false)
  })
})
