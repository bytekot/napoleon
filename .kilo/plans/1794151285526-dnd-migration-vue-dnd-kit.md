# Миграция DnD на @vue-dnd-kit/core

## Цель

Заменить нативный HTML5 Drag and Drop на `@vue-dnd-kit/core` v3 для поддержки:
- touch-устройств (long-press 200 мс из коробки)
- keyboard-drag (Space + стрелки, a11y)
- естественных анимаций (FLIP + overlay)
- multi-drag (запланировано, после стабилизации single-drag)

Текущий алгоритм `computeReorder` и store-логика **не изменяются**. Библиотека заменяет только input-layer (события pointer/keyboard), overlay и визуальные индикаторы.

## Принятые решения

| # | Вопрос | Решение |
|---|---|---|
| 1 | DnDProvider location | `MainPage.vue` (корень UI, unit-тесты компонентов без провайдера) |
| 2 | Adapter directory | `src/composables/dnd/` |
| 3 | useTrackTask / dom.ts | Удалить полностью (включая тесты) |
| 4 | Toggle-period zone | Оставить на hover (не task-DnD concern) |
| 5 | Delete-zone | `makeDroppable` с `accept: 'task'` |
| 6 | Commit strategy | Один коммит на фазу, каждая фаза зелёная в CI |
| 7 | @vue-dnd-kit/actions | Потом, вместе с a11y-кнопками ↑↓ |
| 8 | @vue-dnd-kit/devtools | Сразу в dev-сборку (devDependency) |
| 9 | TaskItem `<label>` | Проверить в пилоте; если drag не стартует — реструктурировать (убрать label-обёртку, заменить на @click) |
| 10 | E2E data seeding | Через API в test fixture (beforeEach → POST /api/tasks) |
| 11 | `:key` в CalendarWeek/Month | Отложено до завершения фазы 2 (O-1) |

## Фаза 0. Подготовка

### 0.1. Установка зависимостей

```bash
pnpm add @vue-dnd-kit/core
pnpm add -D @vue-dnd-kit/devtools
```

### 0.2. Обновить `docs/testing.md`

Добавить раздел **E2E**:
- Соглашение по селекторам: ассерты на `data-task-id` и DOM-порядок; `data-testid` только для уникальных точек
- Паттерн `dragTask()` хелпера в `e2e/fixtures/dnd.ts`
- Разграничение: characterization-тесты (до миграции) vs full-e2e (после)
- Data seeding: beforeEach вызывает API для создания seed-задач

### 0.3. Characterization e2e-тесты (на текущей HTML5-реализации)

**Файл:** `e2e/dnd-characterization.spec.ts`

**Seed fixture:**
```ts
// e2e/fixtures/dnd.ts
export async function seedTasks(apiUrl: string) {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  await fetch(`${apiUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Task A', dueDate: today }),
  })
  // ... 4 more tasks across today, tomorrow, unplanned
}
```

**Тесты (ассерты на конечное состояние, не жест):**
1. Drop из unplanned в конкретный день → задача появилась в дне, ушла из unplanned
2. Drop между днями → cross-day перенос + порядок сохранён
3. Drop на своей позиции → no-op (счётчик API-запросов не увеличился)
4. Drop на корзину → задача удалена
5. Drop в пустую область дня → вставка в конец

**dragTask() хелпер (HTML5-версия):**
```ts
export async function dragTask(
  page: Page,
  fromTaskId: string,
  toSelector: string,
) {
  const from = page.locator(`[data-task-id="${fromTaskId}"]`)
  const to = page.locator(toSelector)
  await from.dragTo(to)
}
```

**Критерий:** `pnpm test:e2e` зелёный; тесты mechanism-agnostic (кроме `dragTo()` в хелпере).

---

## Фаза 1. Adapter-слой

### 1.1. `src/composables/dnd/provider.ts`

```ts
import { DnDProvider } from '@vue-dnd-kit/core'
import { defineComponent } from 'vue'

export const DndScope = defineComponent({
  setup(_, { slots }) {
    return () => h(DnDProvider, null, slots.default?.())
  },
})
```

**Использование в `MainPage.vue`:**
```vue
<template>
  <Layout>
    <DndScope>
      <div class="main-page">
        <TaskForm class="task-form" />
        <Calendar class="calendar" />
      </div>
    </DndScope>
  </Layout>
</template>
```

### 1.2. `src/composables/dnd/sortable.ts`

```ts
import { makeSortableList, makeSortableItem } from '@vue-dnd-kit/core'
import type { Ref } from 'vue'
import { useTaskStore } from '../../stores/task'
import type { Task } from '../../types/tasks'

export function useSortableTaskList(
  listRef: Ref<HTMLElement | null>,
  options: { dueDate: string | null; taskIds: string[] },
) {
  const store = useTaskStore()
  const tasks = computed(() =>
    options.taskIds.map((id) => store.taskById(id)).filter(Boolean) as Task[],
  )

  const { items } = makeSortableList(listRef, {
    id: options.dueDate ?? 'unplanned',
    group: 'tasks',
    items: tasks, // getter → read-only → controlled
    onDrop: (e) => {
      e.preventDefault()
      const taskId = e.keys[0] as string
      const newIndex = e.to.index
      void store.reorderTask(taskId, options.dueDate, newIndex)
    },
  })

  return { items }
}

export function useSortableTaskItem(
  elRef: Ref<HTMLElement | null>,
  options: { task: Task },
) {
  const { isDragging, isPlaceholder, selected } = makeSortableItem(elRef, {
    item: () => options.task,
    disabled: () => options.task.completed,
  })
  return { isDragging, isPlaceholder, selected }
}
```

### 1.3. `src/composables/dnd/droppable.ts`

```ts
import { makeDroppable } from '@vue-dnd-kit/core'
import type { Ref } from 'vue'

export function useDropZone(
  elRef: Ref<HTMLElement | null>,
  options: { id: string; accept?: string; onDrop?: (taskId: string) => void },
) {
  const { isOver } = makeDroppable(elRef, {
    id: options.id,
    accept: options.accept ?? 'task',
    onDrop: (e) => {
      if (options.onDrop && e.active?.id) {
        options.onDrop(e.active.id as string)
      }
    },
  })
  return { isOver }
}
```

### 1.4. `src/composables/dnd/status.ts`

```ts
import { useDnD } from '@vue-dnd-kit/core'

export function useDndStatus() {
  const { status, active } = useDnD()
  const isDragging = computed(() => status === 'dragging')
  const activeId = computed(() => active?.id ?? null)
  return { isDragging, activeId }
}
```

### 1.5. `src/composables/dnd/index.ts`

```ts
export { DndScope } from './provider'
export { useSortableTaskList, useSortableTaskItem } from './sortable'
export { useDropZone } from './droppable'
export { useDndStatus } from './status'
```

**Критерий:** `pnpm check` зелёный; grep показывает ноль импортов `@vue-dnd-kit` вне `src/composables/dnd/`.

---

## Фаза 2. Пилот — reorder внутри одного дня

**Scope:** только `TaskList.vue` + `TaskItem.vue` для одного дня (без cross-day, без action zones, без unplanned).

### 2.1. TaskItem.vue

**До:**
```vue
<div class="task" :draggable="!task.completed" @dragstart="onDragStart">
  <span class="style" />
  <span>
    <label>
      <input type="checkbox" :checked="task.completed" @change="onCheckChange" />
      <span class="checkmark" />
      <span class="text">{{ task.name }}</span>
    </label>
  </span>
</div>
```

**После:**
```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useSortableTaskItem } from '../../composables/dnd'

const props = defineProps<{ task: Task }>()
const el = useTemplateRef<HTMLElement>('el')
const { isDragging, isPlaceholder } = useSortableTaskItem(el, { task: props.task })

function onCheckChange(event: Event) { /* без изменений */ }
</script>

<template>
  <div ref="el" class="task" :class="{ dragged: isPlaceholder, completed: task.completed }">
    <span class="style" />
    <span>
      <input
        type="checkbox"
        :checked="task.completed"
        @change="onCheckChange"
        @click.stop
      />
      <span class="checkmark" />
      <span class="text">{{ task.name }}</span>
    </span>
  </div>
</template>
```

**Изменения:**
- Убрать `draggable`, `@dragstart`, `event.dataTransfer`, `target.addEventListener('dragend')`
- `<label>` убран (проверка pitfall #21); чекбокс + текст теперь siblings, не wrapped
- `@click.stop` на checkbox чтобы клик не всплывал до drag
- `isDragged` → `isPlaceholder` (визуально — «дырка» на месте уехавшей карточки)

### 2.2. TaskList.vue

**До:**
```vue
<div class="task-list" @dragover="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
  <TaskItem v-for="(taskId, index) in taskIds" :key="taskId" :task-id="taskId" />
</div>
```

**После:**
```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useSortableTaskList } from '../../composables/dnd'

const props = defineProps<{ dueDate: string | null }>()
const store = useTaskStore()
const taskIds = computed(() => /* без изменений */)
const listRef = useTemplateRef<HTMLElement>('list')
const { items } = useSortableTaskList(listRef, { dueDate: props.dueDate, taskIds: taskIds.value })
</script>

<template>
  <ul ref="list" class="task-list">
    <TaskItem v-for="task in items" :key="task.id" :task="task" />
  </ul>
</template>
```

**Изменения:**
- Убрать `@dragover`, `@dragleave`, `@drop`, `useTrackTask`, `getDraggedTaskOrder`
- Убрать `border-top/bottom` индикаторы (библиотека даёт FLIP-анимацию соседей)
- `<div>` → `<ul>` (семантика списка; можно оставить `<div>` если стили завязаны)
- `taskIds` (string[]) → `items` (Task[] draft из adapter)
- TaskItem теперь принимает `task: Task` prop вместо `taskId: string`

### 2.3. Удалить `src/composables/useTrackTask.ts` и `src/utils/task/dom.ts`

Включая их тесты (`src/composables/__tests__/useTrackTask.spec.ts`, `src/utils/task/__tests__/dom.spec.ts` если существуют).

**Критерий:**
- `pnpm check` + `pnpm test:unit` зелёные (unit-тесты `computeReorder` и store не затронуты)
- Reorder внутри дня работает в браузере: pointer + keyboard (Tab → Space → ↑/↓ → Space)
- Характеризационный e2e-тест #2 (внутри дня) зелёный после переписывания `dragTask()` на pointer-жест

---

## Фаза 3. Cross-day и unplanned

### 3.1. TaskList.vue — без изменений

Adapter уже передаёт `group: 'tasks'` и `id: dueDate ?? 'unplanned'`. Cross-day drop работает из коробки.

### 3.2. TaskForm.vue (unplanned-список)

```vue
<TaskList :due-date="null" empty-text="Список пуст." class="tasks" />
```

Без изменений. Adapter обрабатывает `dueDate: null` → `id: 'unplanned'`. DnD внутри unplanned — no-op (как сейчас), cross-day → работает.

### 3.3. Drop-handler в adapter

Переводит `(taskId, fromDueDate, toDueDate, newIndex)` → `store.reorderTask(taskId, toDueDate, newIndex)`. Для cross-day `reorderTask` уже работает — изменений в логике нет.

**Критерий:**
- E2E-тесты #1 и #2 зелёные
- Unit-тесты `computeReorder` (группы A, C, D) без изменений

---

## Фаза 4. Action zones (корзина, toggle периода)

### 4.1. ActionArea.vue (корзина)

**До:**
```vue
<div class="action-area" @dragenter="onDragEnter" @dragleave="onDragLeave" @dragover.prevent @drop="onDrop">
  <slot />
</div>
```

**После:**
```vue
<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDropZone } from '../../composables/dnd'

const props = defineProps<{ id: string; dangerous?: boolean }>()
const emit = defineEmits<{ drop: [taskId: string] }>()
const el = useTemplateRef<HTMLElement>('el')
const { isOver } = useDropZone(el, {
  id: props.id,
  accept: 'task',
  onDrop: (taskId) => emit('drop', taskId),
})
</script>

<template>
  <div ref="el" class="action-area" :class="{ dangerous, active: isOver }">
    <slot />
  </div>
</template>
```

**Изменения:**
- Убрать `@dragenter`, `@dragleave`, `@dragover.prevent`, `@drop`, `hovered` ref
- `isOver` из adapter (замена `hovered`)
- `dangerous`-стиль сохраняется

### 4.2. CalendarHeader.vue

**До:**
```vue
<ActionArea class="action-delete" dangerous @drop="onDeleteDrop">
  <Trash size="medium" />
</ActionArea>
```

**После:**
```vue
<ActionArea id="trash" class="action-delete" dangerous @drop="onDeleteDrop">
  <Trash size="medium" />
</ActionArea>
```

**Изменения:**
- Добавить `id="trash"` prop (required для `makeDroppable`)
- `onDeleteDrop` теперь принимает `taskId: string` вместо `DragEvent`

### 4.3. Toggle-period zone

Оставить на hover (не task-DnD concern). Без изменений.

### 4.4. Убрать `calendarStore.movingItemId`

**Файлы:** `src/stores/calendar.ts`, `src/components/task/TaskItem.vue`, `src/components/calendar-header/CalendarHeader.vue`

**Замена:** `isDndMode` → `useDndStatus().isDragging` (computed от `status === 'dragging'`).

**Критерий:**
- E2E-тест #4 (удаление) зелёный
- `dnd-mode` хедера появляется/исчезает при drag
- Unit-тесты `calendarStore` обновлены (удалить `movingItemId`-тесты, добавить `isDndMode` из adapter если нужно)

---

## Фаза 5. Characterization → full e2e

### 5.1. Переписать `dragTask()` в `e2e/fixtures/dnd.ts`

**До (HTML5):**
```ts
await from.dragTo(to)
```

**После (pointer):**
```ts
export async function dragTask(
  page: Page,
  fromTaskId: string,
  toSelector: string,
  options?: { midDragAssert?: () => Promise<void> },
) {
  const from = page.locator(`[data-task-id="${fromTaskId}"]`)
  const to = page.locator(toSelector)

  await from.hover()
  await page.mouse.down()
  await to.hover({ steps: 10 })

  if (options?.midDragAssert) {
    await options.midDragAssert()
  }

  await page.mouse.up()
}
```

### 5.2. Mid-drag ассерты

```ts
await dragTask(page, 'task-1', '.task-list[data-due-date="2026-11-09"]', {
  midDragAssert: async () => {
    await expect(page.locator('[data-dnd-overlay]')).toBeVisible()
    await expect(page.locator('[data-dnd-placeholder]')).toBeVisible()
  },
})
```

### 5.3. Keyboard-drag сценарий (тест a11y)

```ts
test('keyboard drag: Space → ArrowDown → Space', async ({ page }) => {
  await page.goto('/')
  await page.locator('[data-task-id="task-1"]').focus()
  await page.keyboard.press('Space')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Space')
  // Assert new order
})
```

**Критерий:** все 5 characterization-тестов зелёные в обеих модах (pointer + keyboard).

---

## Фаза 6. Touch, multi-drag, анимации (по мере roadmap)

### 6.1. Touch

- Long-press 200 мс уже включён в библиотеке
- E2E на touch — только Chromium + CDP `Input.dispatchTouchEvent`
- Для Firefox/Safari touch в e2e не тестируется (ограничение Playwright)

### 6.2. Multi-drag

**Scope:** после стабилизации single-drag в e2e и production.

**Изменения:**
- Расширение `computeReorder` до массива id (сейчас алгоритм one-task)
- Backend: `PATCH /tasks` уже batch, contract совместим
- UI: `selected` ref на `TaskItem` + Ctrl/Shift-click; rubber band — позже
- Overlay: дефолтный pile из библиотеки

### 6.3. Анимации

- `dropAnimation` — дефолтный
- `animateChanges: true` для non-drag reorder (если добавятся кнопки ↑/↓)
- `prefers-reduced-motion` — учитывается автоматически

---

## Риски и mitigation

| Риск | Вероятность | Mitigation |
|---|---|---|
| `<label>` блокирует drag | Высокая | Проверить в пилоте; реструктурировать HTML |
| `v-for :key="index"` → stale list id | Высокая | Отложено (O-1); до фазы 3 навигация по периодам во время drag — известное ограничение |
| `id` read-once + component reuse | Средняя | Отложено (O-1); adapter передаёт `id: dueDate` |
| Adapter слишком тонкий → утечка library API | Низкая | Code review на каждой фазе; grep на импорты |
| Bus factor 1 у vue-dnd-kit | Средняя | Adapter-слой локализует зависимость; замена библиотеки = переписать 4 файла |
| Playwright touch-drag не работает | Высокая | Touch тестируем только в Chromium + CDP; для остальных — unit-тесты активации |

---

## Критерии завершения

- [ ] Pre-step: (отменён — см. O-1)
- [ ] Фаза 0: `@vue-dnd-kit/core` установлен; `docs/testing.md` обновлён; 5 characterization-тестов зелёные на HTML5
- [ ] Фаза 1: Adapter-слой в `src/composables/dnd/`; `pnpm check` зелёный; ноль импортов библиотеки вне adapter
- [ ] Фаза 2: Пилот (reorder внутри дня) работает; unit-тесты `computeReorder` и store без изменений; e2e #2 зелёный
- [ ] Фаза 3: Cross-day и unplanned работают; e2e #1, #2 зелёные
- [ ] Фаза 4: Action zones (корзина) работают; `movingItemId` удалён из store; e2e #4 зелёный
- [ ] Фаза 5: `dragTask()` переписан на pointer; mid-drag ассерты; keyboard-drag сценарий; все 5 e2e зелёные в обеих модах

---

## Открытые вопросы (возврат после пилота)

### O-1. `:key="index"` в CalendarWeek/CalendarMonth и read-once `id` у `makeSortableList`

**Статус:** отложено до завершения фазы 2.

**Суть.** В `CalendarWeek.vue:16` и `CalendarMonth.vue:29` используется
`:key="index"`. Опция `id` у `makeSortableList` читается один раз при setup.
При навигации по периодам Vue переиспользует компонент — `id` списка остаётся
от предыдущего периода. Cross-day drop после навигации отправит задачу в «призрак» старого дня.

**Почему отложено.** В фазе 2 (reorder внутри одного дня, фиксированный период) баг не проявляется. Решение требует выбора между несколькими вариантами с разными trade-off (per-ISO-дата key = remount компонентов; adapter с auto-id и маппингом = усложнение adapter-слоя). После пилота поведение Vue с этими компонентами будет проверено на фактах, и решение станет обоснованным.

**Триггер возврата:** завершение фазы 2, перед началом фазы 3 (cross-day). Без решения этого вопроса фаза 3 не начинается.

**Кандидаты на решение (зафиксированы для будущего выбора):**
1. `:key="formatDateISO(dayDate)"` — тривиально, remount компонентов при навигации (потеря внутреннего state, для календаря незаметно)
2. Adapter с per-instance `crypto.randomUUID()` и `Map<listId, dueDate>` — компоненты не пересоздаются, adapter усложняется
3. Иной подход, который может подсказать пилот

---

## Ссылки

- Skill: `.kilo/skills/vue-dnd-kit/SKILL.md`
- References: `.kilo/skills/vue-dnd-kit/references/` (sortable.md, draggable-droppable.md, pitfalls.md)
- Текущая реализация: `src/components/task/TaskItem.vue`, `src/components/tasks/TaskList.vue`, `src/components/action-area/ActionArea.vue`
- Алгоритм: `src/utils/task/reordering.ts`, `docs/task-reordering.md`
- Store: `src/stores/task.ts`, `src/stores/calendar.ts`
- E2E: `e2e/smoke.spec.ts`, `playwright.config.ts`
