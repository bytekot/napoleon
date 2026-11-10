import { expect, test } from '@playwright/test'
import { dragTask, seedTasks, taskIdsInList, weekDayISO } from './fixtures/dnd'

// Characterization-тесты: ассерты на конечное состояние, механизм drag изолирован
// в хелпере dragTask (e2e/fixtures/dnd.ts). Дни недели распределены по тестам без
// пересечений: пн — «между днями», вт — «из unplanned», ср — «в конец», чт — «no-op»,
// пт — «из дня в unplanned» (тест 6, источник cross-day в тесте 2).
test.describe('Characterization-тесты DnD', () => {
  test('переносит задачу из unplanned в конкретный день', async ({ page }) => {
    const tuesday = weekDayISO(1)
    const [u1] = await seedTasks([{ name: 'Char U1' }])

    await page.goto('/?period=week')

    await dragTask(page, u1.id, `.task-list[data-due-date="${tuesday}"]`)

    await expect(
      page.locator(`.task-list[data-due-date="${tuesday}"] [data-task-id="${u1.id}"]`),
    ).toBeVisible()

    const tuesdayIds = await taskIdsInList(page, `.task-list[data-due-date="${tuesday}"]`)
    const unplannedIds = await taskIdsInList(page, '.task-list[data-due-date="unplanned"]')

    expect(tuesdayIds).toContain(u1.id)
    expect(unplannedIds).not.toContain(u1.id)
  })

  test('переносит задачу между днями с сохранением порядка', async ({ page }) => {
    const monday = weekDayISO(0)
    const friday = weekDayISO(4)
    const [a1, a2, b1] = await seedTasks([
      { name: 'Char A1', dueDate: monday, order: 0 },
      { name: 'Char A2', dueDate: monday, order: 1 },
      { name: 'Char B1', dueDate: friday, order: 0 },
    ])

    await page.goto('/?period=week')

    // Drop в верхнюю половину A2 → вставка между A1 и A2
    await dragTask(page, b1.id, `[data-task-id="${a2.id}"]`, {
      targetPosition: { x: 0.5, y: 0.1 },
    })

    await expect(
      page.locator(`.task-list[data-due-date="${monday}"] [data-task-id="${b1.id}"]`),
    ).toBeVisible()

    const mondayIds = await taskIdsInList(page, `.task-list[data-due-date="${monday}"]`)
    const fridayIds = await taskIdsInList(page, `.task-list[data-due-date="${friday}"]`)

    expect(mondayIds.indexOf(a1.id)).toBeLessThan(mondayIds.indexOf(b1.id))
    expect(mondayIds.indexOf(b1.id)).toBeLessThan(mondayIds.indexOf(a2.id))
    expect(fridayIds).not.toContain(b1.id)
  })

  test('не выполняет PATCH-запрос при drop задачи на своей позиции', async ({ page }) => {
    const thursday = weekDayISO(3)
    const [n1, n2] = await seedTasks([
      { name: 'Char N1', dueDate: thursday, order: 0 },
      { name: 'Char N2', dueDate: thursday, order: 1 },
    ])

    let patchCount = 0

    page.on('request', (request) => {
      if (request.method() === 'PATCH' && request.url().includes('/api/tasks')) {
        patchCount++
      }
    })

    await page.goto('/?period=week')

    // Drop в верхнюю половину собственной карточки (order=0) → позиция 0 → no-op.
    // midDragAssert исключает vacuous pass: drag гарантированно состоялся.
    // Ассерт на dnd-mode хедера, а не на класс dragged карточки: dragged уходит
    // в фазе 2, dnd-mode сохраняется до фазы 4 включительно
    await dragTask(page, n1.id, `[data-task-id="${n1.id}"]`, {
      targetPosition: { x: 0.5, y: 0.1 },
      midDragAssert: async () => {
        await expect(page.locator('.calendar-header')).toHaveClass(/dnd-mode/)
      },
    })

    // Негативный ассерт: снятие dnd-mode означает, что drop и dragend обработаны —
    // возможный PATCH к этому моменту уже отправлен и учтён счётчиком
    await expect(page.locator('.calendar-header')).not.toHaveClass(/dnd-mode/)

    expect(patchCount).toBe(0)

    const thursdayIds = await taskIdsInList(page, `.task-list[data-due-date="${thursday}"]`)

    expect(thursdayIds.indexOf(n1.id)).toBeLessThan(thursdayIds.indexOf(n2.id))
  })

  test('удаляет задачу при drop на корзину', async ({ page }) => {
    const [u2] = await seedTasks([{ name: 'Char U2' }])

    await page.goto('/?period=week')

    await dragTask(page, u2.id, '.action-delete')

    await expect(page.locator(`[data-task-id="${u2.id}"]`)).toHaveCount(0)
  })

  test('вставляет задачу в конец списка при drop на пустую область дня', async ({ page }) => {
    const wednesday = weekDayISO(2)
    const [c1, u3] = await seedTasks([
      { name: 'Char C1', dueDate: wednesday, order: 0 },
      { name: 'Char U3' },
    ])

    await page.goto('/?period=week')

    // Drop в нижнюю часть контейнера дня, ниже всех задач
    await dragTask(page, u3.id, `.task-list[data-due-date="${wednesday}"] [data-task-list]`, {
      targetPosition: { x: 0.5, y: 0.95 },
    })

    await expect(
      page.locator(`.task-list[data-due-date="${wednesday}"] [data-task-id="${u3.id}"]`),
    ).toBeVisible()

    const wednesdayIds = await taskIdsInList(page, `.task-list[data-due-date="${wednesday}"]`)
    const unplannedIds = await taskIdsInList(page, '.task-list[data-due-date="unplanned"]')

    expect(wednesdayIds).toContain(c1.id)
    expect(wednesdayIds[wednesdayIds.length - 1]).toBe(u3.id)
    expect(unplannedIds).not.toContain(u3.id)
  })

  test('переносит задачу из конкретного дня в unplanned', async ({ page }) => {
    const friday = weekDayISO(4)
    const [d1, d2] = await seedTasks([
      { name: 'Char D1', dueDate: friday, order: 0 },
      { name: 'Char D2', dueDate: friday, order: 1 },
    ])

    await page.goto('/?period=week')

    await dragTask(page, d1.id, '.task-list[data-due-date="unplanned"]')

    await expect(
      page.locator('.task-list[data-due-date="unplanned"] [data-task-id="' + d1.id + '"]'),
    ).toBeVisible()

    const fridayIds = await taskIdsInList(page, `.task-list[data-due-date="${friday}"]`)
    const unplannedIds = await taskIdsInList(page, '.task-list[data-due-date="unplanned"]')

    expect(fridayIds).not.toContain(d1.id)
    expect(fridayIds).toContain(d2.id)
    expect(unplannedIds).toContain(d1.id)
  })
})
