import type { Page } from '@playwright/test'

// Порт E2E-API задан в webServer[1] playwright.config.ts
const E2E_API_URL = 'http://localhost:3101'

export interface SeedTaskInput {
  name: string
  dueDate?: string
  // Применяется только вместе с dueDate: без даты задача остаётся unplanned
  order?: number
}

export interface SeededTask {
  id: string
  name: string
}

export interface DragOptions {
  // Точка drop в долях размера цели (0..1); по умолчанию — центр
  targetPosition?: { x: number; y: number }
  // Вызывается после старта drag, до перемещения к цели — для mid-drag ассертов
  midDragAssert?: () => Promise<void>
}

// ISO-дата дня текущей недели: 0 — понедельник. Повторяет логику src/utils/calendar.ts
export function weekDayISO(offsetFromMonday: number): string {
  const now = new Date()
  const weekDay = now.getDay()
  const mondayShift = weekDay === 0 ? -6 : 1 - weekDay
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + mondayShift + offsetFromMonday,
  )
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// POST /api/tasks принимает только name + creationDate, поэтому dueDate/order
// устанавливаются отдельным PATCH-запросом
export async function seedTasks(inputs: SeedTaskInput[]): Promise<SeededTask[]> {
  const seeded: SeededTask[] = []

  for (const input of inputs) {
    const createResponse = await fetch(`${E2E_API_URL}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: input.name, creationDate: new Date().toISOString() }),
    })

    if (!createResponse.ok) {
      throw new Error(`Seed POST /api/tasks failed: ${createResponse.status}`)
    }

    const created = (await createResponse.json()) as { id: string }

    if (input.dueDate !== undefined) {
      const editResponse = await fetch(`${E2E_API_URL}/api/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ id: created.id, dueDate: input.dueDate, order: input.order ?? 0 }]),
      })

      if (!editResponse.ok) {
        throw new Error(`Seed PATCH /api/tasks failed: ${editResponse.status}`)
      }
    }

    seeded.push({ id: created.id, name: input.name })
  }

  return seeded
}

// HTML5-версия хелпера (characterization-тесты до миграции на @vue-dnd-kit/core).
// Жест изолирован здесь: тесты ассертят только конечное состояние.
export async function dragTask(
  page: Page,
  fromTaskId: string,
  toSelector: string,
  options: DragOptions = {},
): Promise<void> {
  const notPlaceholder = ':not([data-dnd-placeholder])'
  const from = page.locator(`[data-task-id="${fromTaskId}"]${notPlaceholder}`)
  const to = page.locator(
    toSelector.includes('[data-task-id') ? `${toSelector}${notPlaceholder}` : toSelector,
  )

  await from.waitFor({ state: 'visible' })

  const fromBox = await from.boundingBox()

  if (!fromBox) {
    throw new Error(`Нет bounding box у задачи ${fromTaskId}`)
  }

  const startX = fromBox.x + fromBox.width / 2
  const startY = fromBox.y + fromBox.height / 2

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  // Небольшое смещение после mouse.down инициирует HTML5-drag (dragstart)
  await page.mouse.move(startX + 5, startY + 5, { steps: 3 })

  if (options.midDragAssert) {
    await options.midDragAssert()
  }

  // Цель может становиться видимой только после начала drag (корзина в хедере)
  await to.waitFor({ state: 'visible' })

  const toBox = await to.boundingBox()

  if (!toBox) {
    throw new Error(`Нет bounding box у цели ${toSelector}`)
  }

  const targetX = toBox.x + toBox.width * (options.targetPosition?.x ?? 0.5)
  const targetY = toBox.y + toBox.height * (options.targetPosition?.y ?? 0.5)

  await page.mouse.move(targetX, targetY, { steps: 10 })
  await page.mouse.up()
}

export async function taskIdsInList(page: Page, listSelector: string): Promise<string[]> {
  const items = await page.locator(`${listSelector} [data-task-id]`).all()
  const ids: string[] = []

  for (const item of items) {
    const id = await item.getAttribute('data-task-id')

    if (id !== null) {
      ids.push(id)
    }
  }

  return ids
}
