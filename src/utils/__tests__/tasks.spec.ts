import { describe, it, expect } from 'vitest'
import { getDraggedTaskOrder } from '../tasks'

describe('getDraggedTaskOrder', () => {
  it('игнорирует текстовые узлы при расчёте позиции', () => {
    document.body.innerHTML = `
      <div data-tasks>
        <div data-task>A</div>
        <div data-task>B</div>
      </div>`
    const tasks = document.querySelector('[data-tasks]')!
    const second = tasks.children[1] as HTMLElement

    second.getBoundingClientRect = () => ({ y: 100, height: 20 }) as DOMRect

    expect(getDraggedTaskOrder(second, 105)).toBe(1)
  })

  it('возвращает 0 если нет контейнера data-tasks', () => {
    document.body.innerHTML = '<div><div data-task>A</div></div>'
    const task = document.querySelector('[data-task]')!

    expect(getDraggedTaskOrder(task, 100)).toBe(0)
  })

  it('возвращает order + 1 если clientY в нижней половине', () => {
    document.body.innerHTML = `
      <div data-tasks>
        <div data-task>A</div>
        <div data-task>B</div>
      </div>`
    const tasks = document.querySelector('[data-tasks]')!
    const second = tasks.children[1] as HTMLElement

    second.getBoundingClientRect = () => ({ y: 100, height: 20 }) as DOMRect

    expect(getDraggedTaskOrder(second, 115)).toBe(2)
  })

  it('возвращает childElementCount если нет data-task внутри', () => {
    document.body.innerHTML = `
      <div data-tasks>
        <div>Not a task</div>
        <div>Another</div>
      </div>`
    const container = document.querySelector('[data-tasks]')!

    expect(getDraggedTaskOrder(container, 100)).toBe(2)
  })
})
