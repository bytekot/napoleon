import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref, type ComputedRef } from 'vue'
import { setActivePinia, createPinia, type Pinia } from 'pinia'
import { DndScope } from '../../../composables/dnd'
import CalendarHeader from '../CalendarHeader.vue'
import { useCalendarStore } from '../../../stores/calendar'

vi.mock('../../../composables/dnd', async () => {
  const actual = await vi.importActual<typeof import('../../../composables/dnd')>(
    '../../../composables/dnd',
  )

  return {
    ...actual,
    useDndStatus: vi.fn(),
  }
})

const mockUseDndStatus = vi.mocked((await import('../../../composables/dnd')).useDndStatus)

function mockRef<T>(value: T) {
  return ref(value) as unknown as ComputedRef<T>
}

describe('CalendarHeader', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()
    mockUseDndStatus.mockReturnValue({ isDragging: mockRef(false), activeId: mockRef(null) })
  })

  function mountHeader() {
    const TestWrapper = defineComponent({
      components: { DndScope, CalendarHeader },
      setup() {
        return () => h(DndScope, null, () => h(CalendarHeader))
      },
    })

    return mount(TestWrapper, { global: { plugins: [pinia] } })
  }

  it('рендерит текст периода (месяц + год)', () => {
    const store = useCalendarStore()

    store.setDate(new Date(2026, 0, 15))

    const wrapper = mountHeader()

    expect(wrapper.find('h1').text()).toBe('Январь 2026')
  })

  it('рендерит корректный текст для другого месяца', () => {
    const store = useCalendarStore()

    store.setDate(new Date(2026, 5, 20))

    const wrapper = mountHeader()

    expect(wrapper.find('h1').text()).toBe('Июнь 2026')
  })

  it('добавляет класс dnd-mode когда isDragging === true', () => {
    mockUseDndStatus.mockReturnValue({ isDragging: mockRef(true), activeId: mockRef(null) })

    const wrapper = mountHeader()

    expect(wrapper.find('.calendar-header').classes()).toContain('dnd-mode')
  })

  it('не добавляет класс dnd-mode когда isDragging === false', () => {
    mockUseDndStatus.mockReturnValue({ isDragging: mockRef(false), activeId: mockRef(null) })

    const wrapper = mountHeader()

    expect(wrapper.find('.calendar-header').classes()).not.toContain('dnd-mode')
  })
})
