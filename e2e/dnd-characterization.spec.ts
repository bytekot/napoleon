import { expect, test } from '@playwright/test'
import { dragTask, fetchTasks, seedTasks, taskIdsInList, weekDayISO } from './fixtures/dnd'

// Characterization-тесты: ассерты на конечное состояние, механизм drag изолирован
// в хелпере dragTask (e2e/fixtures/dnd.ts). Дни недели распределены по тестам без
// пересечений: пн — «между днями», вт — «из unplanned», ср — «в конец», чт — «no-op»,
// пт — «из дня в unplanned» (тест 6, источник cross-day в тесте 2).
// Keyboard-тесты (K1–K3) используют дни, пересекающиеся с pointer-тестами;
// изоляция через отдельные seeds.
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

test.describe('Keyboard DnD', () => {
  test('перемещает задачу вниз внутри дня (Space → ArrowDown → Space)', async ({ page }) => {
    // Используем вторник (test #1 перемещает задачу ВО вторник, но сама задача создаётся в unplanned)
    // K1 создаёт свои задачи напрямую во вторник, конфликт минимален
    const tuesday = weekDayISO(1)
    const [k1, k2, k3] = await seedTasks([
      { name: 'Key K1', dueDate: tuesday, order: 0 },
      { name: 'Key K2', dueDate: tuesday, order: 1 },
      { name: 'Key K3', dueDate: tuesday, order: 2 },
    ])

    await page.goto('/?period=week')

    const taskEl = page.locator(`[data-task-id="${k1.id}"]:not([data-dnd-placeholder])`)

    await taskEl.focus()
    await page.keyboard.press('Space')

    // Ждём активации drag
    await expect(page.locator('.calendar-header')).toHaveClass(/dnd-mode/)

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Space')

    // Ждём завершения drop
    await expect(page.locator('.calendar-header')).not.toHaveClass(/dnd-mode/)

    // Ассерт через API с ретраями
    await expect(async () => {
      const tasks = await fetchTasks()
      const ourIds = new Set([k1.id, k2.id, k3.id])
      const tuesdayTasks = tasks
        .filter((t) => t.dueDate === tuesday && ourIds.has(t.id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

      expect(tuesdayTasks.map((t) => t.id)).toEqual([k2.id, k1.id, k3.id])
    }).toPass({ timeout: 5000 })
  })

  test('переносит задачу в другой день стрелками (Space → ArrowRight → Space)', async ({
    page,
  }) => {
    const monday = weekDayISO(0)
    const tuesday = weekDayISO(1)
    const [kc] = await seedTasks([{ name: 'Key Cross', dueDate: monday, order: 0 }])

    await page.goto('/?period=week')

    const taskEl = page.locator(`[data-task-id="${kc.id}"]:not([data-dnd-placeholder])`)

    await taskEl.focus()
    await page.keyboard.press('Space')

    await expect(page.locator('.calendar-header')).toHaveClass(/dnd-mode/)

    // Week-view: дни слева направо → ArrowRight перемещает в следующий день
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Space')

    await expect(page.locator('.calendar-header')).not.toHaveClass(/dnd-mode/)

    // Ассерт через API с ретраями
    await expect(async () => {
      const tasks = await fetchTasks()
      const moved = tasks.find((t) => t.id === kc.id)

      expect(moved?.dueDate).toBe(tuesday)
    }).toPass({ timeout: 5000 })
  })

  test('отмена drag по Escape оставляет задачу на месте', async ({ page }) => {
    const wednesday = weekDayISO(2)
    const [ke1, ke2] = await seedTasks([
      { name: 'Key Esc1', dueDate: wednesday, order: 0 },
      { name: 'Key Esc2', dueDate: wednesday, order: 1 },
    ])

    let patchCount = 0

    page.on('request', (req) => {
      if (req.method() === 'PATCH' && req.url().includes('/api/tasks')) patchCount++
    })

    await page.goto('/?period=week')

    const taskEl = page.locator(`[data-task-id="${ke1.id}"]:not([data-dnd-placeholder])`)

    await taskEl.focus()
    await page.keyboard.press('Space')

    await expect(page.locator('.calendar-header')).toHaveClass(/dnd-mode/)

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Escape')

    // Ассерт: PATCH не отправлен, dnd-mode снят, порядок сохранён
    await expect(page.locator('.calendar-header')).not.toHaveClass(/dnd-mode/)
    expect(patchCount).toBe(0)

    const wednesdayIds = await taskIdsInList(page, `.task-list[data-due-date="${wednesday}"]`)

    expect(wednesdayIds.indexOf(ke1.id)).toBeLessThan(wednesdayIds.indexOf(ke2.id))
  })
})
