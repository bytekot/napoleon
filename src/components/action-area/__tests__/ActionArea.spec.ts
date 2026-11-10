import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick, type ComputedRef } from 'vue'
import ActionArea from '../ActionArea.vue'

vi.mock('../../../composables/dnd', () => ({
  useDropZone: vi.fn(),
}))

const mockUseDropZone = vi.mocked(await import('../../../composables/dnd')).useDropZone

function mockIsOver(initialValue: boolean) {
  return ref(initialValue) as unknown as ComputedRef<boolean>
}

describe('ActionArea', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('drop-mode (с id prop)', () => {
    it('вызывает useDropZone с правильными параметрами', () => {
      const isOver = mockIsOver(false)

      mockUseDropZone.mockReturnValue({ isOver })

      mount(ActionArea, {
        props: { id: 'trash', dangerous: true },
      })

      expect(mockUseDropZone).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: 'trash',
          accept: '*',
        }),
      )
    })

    it('emit drop с taskId при onDrop callback', async () => {
      const isOver = mockIsOver(false)
      let capturedOnDrop: ((taskId: string) => void) | undefined

      mockUseDropZone.mockImplementation((_el, options) => {
        capturedOnDrop = options.onDrop

        return { isOver }
      })

      const wrapper = mount(ActionArea, {
        props: { id: 'trash' },
      })

      expect(capturedOnDrop).toBeDefined()

      capturedOnDrop!('task-123')
      await nextTick()

      expect(wrapper.emitted('drop')).toEqual([['task-123']])
    })

    it('добавляет класс active когда isOver === true', async () => {
      const isOver = mockIsOver(false)

      mockUseDropZone.mockReturnValue({ isOver })

      const wrapper = mount(ActionArea, {
        props: { id: 'trash' },
      })

      expect(wrapper.find('.action-area').classes()).not.toContain('active')

      ;(isOver as unknown as { value: boolean }).value = true
      await nextTick()

      expect(wrapper.find('.action-area').classes()).toContain('active')
    })

    it('не emit enter в drop-mode', async () => {
      const isOver = mockIsOver(false)
      let capturedOnDragEnter: (() => void) | undefined

      mockUseDropZone.mockImplementation((_el, options) => {
        capturedOnDragEnter = options.onDragEnter

        return { isOver }
      })

      const wrapper = mount(ActionArea, {
        props: { id: 'trash' },
      })

      expect(capturedOnDragEnter).toBeDefined()

      capturedOnDragEnter!()
      await nextTick()

      expect(wrapper.emitted('enter')).toBeUndefined()
    })
  })

  describe('hover-mode (без id prop)', () => {
    it('вызывает useDropZone с синтетическим id', () => {
      const isOver = mockIsOver(false)

      mockUseDropZone.mockReturnValue({ isOver })

      mount(ActionArea)

      expect(mockUseDropZone).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          id: 'action-area-hover',
          accept: '*',
        }),
      )
    })

    it('emit enter при onDragEnter callback', async () => {
      const isOver = mockIsOver(false)
      let capturedOnDragEnter: (() => void) | undefined

      mockUseDropZone.mockImplementation((_el, options) => {
        capturedOnDragEnter = options.onDragEnter

        return { isOver }
      })

      const wrapper = mount(ActionArea)

      expect(capturedOnDragEnter).toBeDefined()

      capturedOnDragEnter!()
      await nextTick()

      expect(wrapper.emitted('enter')).toHaveLength(1)
    })

    it('добавляет класс active при isOver', async () => {
      const isOver = mockIsOver(false)

      mockUseDropZone.mockReturnValue({ isOver })

      const wrapper = mount(ActionArea)

      expect(wrapper.find('.action-area').classes()).not.toContain('active')

      ;(isOver as unknown as { value: boolean }).value = true
      await nextTick()

      expect(wrapper.find('.action-area').classes()).toContain('active')
    })

    it('не emit drop в hover-mode', async () => {
      const isOver = mockIsOver(false)
      let capturedOnDrop: ((taskId: string) => void) | undefined

      mockUseDropZone.mockImplementation((_el, options) => {
        capturedOnDrop = options.onDrop

        return { isOver }
      })

      const wrapper = mount(ActionArea)

      expect(capturedOnDrop).toBeDefined()

      capturedOnDrop!('task-123')
      await nextTick()

      expect(wrapper.emitted('drop')).toBeUndefined()
    })
  })

  describe('dangerous prop', () => {
    it('добавляет класс dangerous', () => {
      const isOver = mockIsOver(false)

      mockUseDropZone.mockReturnValue({ isOver })

      const wrapper = mount(ActionArea, {
        props: { dangerous: true },
      })

      expect(wrapper.find('.action-area').classes()).toContain('dangerous')
    })
  })
})
