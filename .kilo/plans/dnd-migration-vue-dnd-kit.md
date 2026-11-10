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
| 11 | `:key` в CalendarWeek/Month | `:key="formatDateISO(dayDate)"` на `<CalendarDay>` (решено 2026-11-10, см. F3-1) |
| 12 | Drop-handler индекс | Переход на `e.result.get(e.to.list)` + `findIndex` (F3-2) |
| 13 | Unplanned intra-list drag | `sort: false` (F3-4) |
| 14 | E2E day → unplanned | Добавить тест #6 (F3-3) |
| 15 | Month-view scope | Ручной smoke-check, без e2e (F3-5) |
| 16 | Day-header droppable | Out of scope для фазы 3 (F3-6) |

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

### 0.4. Решения, принятые при реализации фазы 0

Реализация фазы 0 отклонилась от буквального кода в 0.2–0.3 по причинам ниже. Решения
приняты агентом при реализации, пользователь подтвердил их постфактум (2026-11-09).
Раздел 0.3 остаётся историческим описанием замысла; фактическая реализация — здесь.

#### D-1. Дни seed: пн–пт текущей недели вместо today/tomorrow

- **Проблема 1 (детерминизм):** при запуске в воскресенье `tomorrow` — следующая неделя,
  её нет в week-view (`getWeekDayDates` начинается с понедельника текущей недели) → тесты
  #1, #2 сломались бы один раз в неделю.
- **Проблема 2 (общая БД):** E2E-БД чистится один раз на прогон (webServer,
  `reuseExistingServer: false`); docs/testing.md §5 запрещает зависимость от порядка тестов.
  На общих днях мутации одних тестов (перенос, удаление) ломают чувствительные к составу
  списка сценарии других (no-op, вставка в конец).
- **Распределение (зафиксировано, не пересматривать без нужды):** пн — цель cross-day (тест 2),
  вт — цель unplanned→день (тест 1), ср — вставка в конец (тест 5), чт — no-op (тест 3),
  пт — источник cross-day (тест 2). Корзина и unplanned — общие, ассерты по id.
- **Отклонённая альтернатива:** `describe.serial` + общий `beforeAll` seed — нарушает
  «тесты не должны зависеть от порядка выполнения» (docs/testing.md §5).
- **Известная хрупкость:** конвенция распределения живёт в комментарии spec-файла и
  docs/testing.md §5; новый тест, занявший «чужой» день, сломает чувствительные сценарии.

#### D-2. Seed в теле каждого теста вместо общего beforeEach

- Суть решения №10 (seed через API до `page.goto`) сохранена; изменена форма: каждый тест
  создаёт только нужные ему задачи (1–3) и адресует их по возвращённым `id`.
- **Мотив:** общий seed 5 задач × 5 тестов → до ~10 карточек в колонке дня к концу прогона;
  колонки и сайдбар `overflow: hidden` → риск клиппинга и неточных drop-координат.
- **Побочный эффект (плюс):** относительные ассерты (`indexOf`, последний элемент, `toContain`)
  устойчивы к Playwright-retries (CI: `retries: 2`) — повторный seed дублирует задачи,
  но ассерты на собственные id остаются валидны.

#### D-3. `page.goto('/?period=week')` вместо `'/'`

- Фиксирует week-view независимо от `DEFAULT_CALENDAR_PERIOD` (сейчас `week`).
  При смене дефолта тесты не сломаются молча (month-view: mini-колонки, другие размеры).
- Механизм штатный: `useCalendarRoute` читает `route.query.period` (immediate watch).

#### D-4. `data-due-date="unplanned"` при `dueDate: null`

- **Самое спорное решение:** атрибут с именем `due-date` и значением не-даты семантически
  неряшлив. Осознанный компромисс.
- **Обоснование:** совпадает с конвенцией adapter-слоя фазы 1 (`id: dueDate ?? 'unplanned'`,
  см. 1.2 и 3.2) → единый формат селектора `.task-list[data-due-date="..."]` для всех списков.
- **Отклонённая альтернатива:** не рендерить атрибут для null + селектор сайдбара
  `.task-form .task-list` — чище семантически, но два стиля селекторов в тестах.
- Если в фазе 1 конвенция id изменится — атрибут синхронизировать с ней.

#### D-5. Единый mouse-based `dragTask()` вместо `dragTo()`

- **Честная формулировка:** `dragTo()` неработоспособен только для корзины — цель
  `display: none` до `dnd-mode`, actionability-проверка Playwright падает до `dragstart`.
  Для остальных четырёх тестов `dragTo()` был пригоден.
- **Мотив единого хелпера:** фаза 5 всё равно переписывает `dragTask()` на pointer-жест —
  тесты уже написаны против финального API, миграция = замена внутренностей хелпера
  (сигнатура `(page, fromTaskId, toSelector, options?)` совпадает с примером фазы 5).
- **Схема жеста:** hover центра источника → `mouse.down` → сдвиг +5px (порог `dragstart`) →
  `midDragAssert` (если задан) → `waitFor visible` цели → `mouse.move` в точку drop
  (`steps: 10`) → `mouse.up`.
- **`targetPosition`** — доли размера цели (0..1), не пиксели: устойчивее к разным размерам
  карточек (mini в month-view vs обычные в week-view). `y < 0.5` — вставка перед целью,
  `y >= 0.5` — после; drop в контейнер `[data-task-list]` ниже карточек — вставка в конец.

#### D-6. Усиление теста 3 (no-op): `midDragAssert`

- **Исходная слабость (vacuous pass):** если бы drag не стартовал вообще, `patchCount === 0`
  и порядок сохранён → тест прошёл бы, ничего не проверив.
- **Исправление:** хелпер получил хук `midDragAssert()` (вызывается после `dragstart`,
  до перемещения к цели); тест 3 ассертит класс `dnd-mode` на `.calendar-header`.
- **Почему `dnd-mode`, а не класс `dragged` на карточке:** `dragged` заменяется
  `isPlaceholder` в фазе 2; `dnd-mode` на хедере сохраняется до фазы 4 включительно
  (критерий фазы 4: «dnd-mode хедера появляется/исчезает при drag») — ассерт переживает
  всю миграцию.

#### D-7. Правки по итогам ревью (2026-11-09)

- **Тест 3: событийное ожидание вместо `waitForTimeout(500)`.** После жеста ожидается
  снятие `dnd-mode` с `.calendar-header` (`expect(...).not.toHaveClass(/dnd-mode/)`).
  Обоснование: drop-handler выполняется до `dragend`, синхронная часть `reorderTask`
  вплоть до вызова `fetch` исполняется сразу — к моменту снятия класса любой потенциальный
  PATCH уже отправлен и учтён `page.on('request')`. Негативный ассерт детерминирован.
- **docs/testing.md:** конвенция `page.goto('/')` дополнена query-параметрами (устранено
  противоречие с D-3); в DnD-разделе — пункт «Период» (`/?period=week`) и требование
  писать mid-drag ассерты через авто-ретрающийся `expect` (хук вызывается сразу после
  старта drag, до применения состояния фреймворком).
- **Мелочи:** тип ответа seed-хелпера сужен до `{ id: string }`; `order` в `SeedTaskInput`
  документирован как применяемый только вместе с `dueDate`; dependencies в `package.json`
  возвращены к алфавитному порядку.
- **Осознанно не менялось:** дублирование `weekDayISO` и `E2E_API_URL` — устранение
  потребовало бы кросс-проектных импортов (`src/` → e2e, `playwright.config.ts` → e2e),
  не проверенных на совместимость с `vue-tsc --build` (tsconfig.e2e включает только
  `e2e/**`); фикстуры остаются самодостаточными. `dragTask` без `mouse.up` в finally —
  незавершённый жест в trace сохраняет mid-drag состояние, полезное для диагностики.

#### Известные слабости, оставленные осознанно (не утверждено как приемлемые навсегда)

- `E2E_API_URL` в `e2e/fixtures/dnd.ts` дублирует порт из `playwright.config.ts`
  (компенсировано комментарием; при смене порта править оба места).
- Строка селектора `.task-list[data-due-date="..."]` дублируется в тестах — осознанно,
  ради читаемости arrange→act→assert сверху вниз.
- **Рекомендация (не утверждено):** перед фазой 2 проверить чувствительность сюиты —
  временно сломать DnD (например, убрать `preventDefault` в `onDragOver` TaskList) и
  убедиться, что тесты падают (docs/testing.md §9 «При исправлении бага»).


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
import { computed, type Ref } from 'vue'
import { makeSortableList, makeSortableItem } from '@vue-dnd-kit/core'
import { useTaskStore } from '../../stores/task'
import type { Task } from '../../types/tasks'

export function useSortableTaskList(
  listRef: Ref<HTMLElement | null>,
  options: { dueDate: string | null; taskIds: () => readonly string[] },
) {
  const store = useTaskStore()

  const tasks = computed(
    () =>
      options
        .taskIds()
        .map((id) => store.taskById(id))
        .filter(Boolean) as Task[],
  )

  const { items } = makeSortableList(listRef, {
    id: options.dueDate ?? 'unplanned',
    group: 'tasks',
    items: tasks, // computed → read-only → controlled
    onDrop: (e) => {
      e.preventDefault()

      const taskId = e.keys[0] as string
      const newIndex = e.to.index

      void store.reorderTask(taskId, options.dueDate, newIndex)
    },
  })

  return { items }
}

export function useSortableTaskItem(elRef: Ref<HTMLElement | null>, options: { task: Task }) {
  const { isDragging, isPlaceholder, selected } = makeSortableItem(elRef, {
    item: () => options.task,
    disabled: () => options.task.completed,
  })

  return { isDragging, isPlaceholder, selected }
}
```

**`taskIds` — getter, не массив.** `computed` регистрирует зависимости только прочитанные
во время вычисления: переданный массив — снимок на момент `setup`, draft `items` расходится
со store (создание/удаление/перенос не попадают в список). Getter читается внутри `computed`
→ реактивность штатная, `watch` не нужен. Вызывающий передаёт `() => taskIds.value`.

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
const { items } = useSortableTaskList(listRef, {
  dueDate: props.dueDate,
  taskIds: () => taskIds.value,
})
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

### 2.4. Известная промежуточная поломка (до Фазы 4)

Фаза 2 удаляет вызов `calendarStore.setMovingItemId` из TaskItem, но `isDndMode` в
CalendarHeader всё ещё читает `movingItemId`. Результат:

- **E2E-тесты #3 (no-op + midDragAssert на dnd-mode) и #4 (корзина) красные.** Тест #3
  падает на `toHaveClass(/dnd-mode/)` в midDragAssert; тест #4 — на таймауте видимости
  `.action-delete` (`display: none` до `dnd-mode`).
- **В приложении корзина недоступна через drag** между Фазой 2 и Фазой 4: `dnd-mode`
  никогда не появляется, `action-delete` остаётся скрытой. Удаление задач возможно только
  через API или будущие UI-альтернативы.

Это осознанный компромисс фазного подхода: Фаза 4 переносит `isDndMode` на
`useDnDStatus().isDragging` и заменяет HTML5-хендлеры ActionArea на `makeDroppable`,
после чего тесты #3 и #4 снова зеленеют. До этого момента решение №6 плана («каждая фаза
зелёная в CI») выполняется только для подмножества тестов, указанных в критерии фазы 2.

### 2.5. Решения, принятые при реализации фазы 2 (по итогам ревью, 2026-11-09)

- **R-1. Toggle по клику всей карточки.** Скетч 2.1 оставлял чекбокс без способа
  переключения мышью (label удалён, `@click` не добавлен). Фактически: `@click` на корневом
  `div[data-task]` → `editTask(completed: !task.completed)`; у чекбокса `@click.stop`
  (чтобы не было двойного toggle) и `@keydown.stop` (Space/Enter переключают и не всплывают
  до keyboard-сенсора библиотеки). После drag библиотека сама глотает click (pitfall #31) —
  случайного toggle при drop нет.
- **R-2. `aria-label` на чекбоксе.** Без label input потерял accessible name;
  `:aria-label="task.name"` возвращает его скринридеру.
- **R-3. `task` в `useSortableTaskItem` — геттер (`MaybeRefOrGetter` + `toValue`).**
  Скетч фазы 1 передавал объект значением: снимок устаревал после любой замены объекта
  в store (editTask/reorderTask), ломая `disabled` и данные overlay при переиспользовании
  компонента (`:key="task.id"`). Геттер — предписанный паттерн библиотеки (pitfall #16).
- **R-4. `showAddIcon` = `isOver && taskIds.length === 0`.** Промежуточная реализация
  показывала «+» у любого пустого списка всегда, делая ветку `empty-text` недостижимой.
  Старая семантика (только при drag-over) восстановлена через `isOver` из `makeSortableList`
  (аналог прежнего `position !== null`).
- **R-5. `<li>`-обёртки в `<ul>` вместо скетча 2.2** (TaskItem прямым потомком `ul`):
  `<ul>` требует `<li>`, измерение библиотеки работает по ref-элементу карточки — e2e
  подтверждает. Margin перенесён на `> li`.
- **R-6. Тесты компонентов** (TaskItem, TaskList) монтируются внутри `DndScope`
  (композитables требуют провайдера); CalendarWeek/Month/TaskForm стабят `TaskList`.
  В TaskItem.spec добавлены тесты toggle-клика и `aria-label`; mount — с `unmount()`
  в `afterEach` (attachTo document.body).

---

## Фаза 3. Cross-day и unplanned

### Решения, принятые перед фазой 3

| # | Вопрос | Решение |
|---|---|---|
| F3-1 | O-1: stale `id` и closure при навигации | `:key="formatDateISO(dayDate)"` на `<CalendarDay>` в CalendarWeek и CalendarMonth |
| F3-2 | Семантика `e.to.index` | Переход на `e.result.get(e.to.list)` + `findIndex` |
| F3-3 | E2E покрытие day → unplanned | Добавить тест #6 |
| F3-4 | Unplanned intra-list drag | `sort: false` для unplanned-списка |
| F3-5 | Month-view в scope | Ручной smoke-check cross-day в month-view |
| F3-6 | Day-header droppable | Out of scope для фазы 3 |

### 3.1. O-1: `:key="formatDateISO(dayDate)"` на CalendarDay

**Файлы:** `src/components/calendar-week/CalendarWeek.vue`, `src/components/calendar-month/CalendarMonth.vue`

**До:**
```vue
<CalendarDay v-for="(dayDate, index) in weekDates" :key="index" :date="dayDate">
```

**После:**
```vue
<CalendarDay v-for="dayDate in weekDates" :key="formatDateISO(dayDate)" :date="dayDate">
```

Аналогично в CalendarMonth.vue (строка 28–29).

**Обоснование:** `makeSortableList` читает `id` один раз при setup; замыкание `options.dueDate` в `onDrop` тоже захватывается при setup. При reuse компонента (`:key="index"`) навигация между периодами приводит к stale list ID и stale dueDate в onDrop → silent data corruption. Remount при смене даты устраняет обе проблемы по конструкции. CalendarDay и TaskList stateless — потеря внутреннего состояния несущественна. Автоматически защищает будущий day-header droppable в фазе 4.

### 3.2. Adapter: переход на `e.result` и `sort: false`

**Файл:** `src/composables/dnd/sortable.ts`

**Изменения в `useSortableTaskList`:**

1. Передать `sort: options.dueDate !== null` в `makeSortableList` (для unplanned `sort: false`).
2. Заменить `e.to.index` на позицию из `e.result`:

```ts
const { items, isOver } = makeSortableList(listRef, {
  id: options.dueDate ?? 'unplanned',
  group: 'tasks',
  items: tasks,
  sort: options.dueDate !== null,
  onDrop: (e) => {
    e.preventDefault()

    const taskId = e.keys[0] as string
    const targetList = e.result.get(e.to.list)

    if (!targetList) return

    const newIndex = targetList.findIndex((t) => t.id === taskId)

    if (newIndex === -1) return

    void store.reorderTask(taskId, options.dueDate, newIndex)
  },
})
```

**Обоснование `e.result`:** каноническое post-drop состояние ([sortable.md#138, #169–181](../skills/vue-dnd-kit/references/sortable.md)), не зависит от недокументированной семантики `e.to.index`. Одинаково работает для same-day и cross-day. `findIndex` по списку одного дня — O(n) при n < 50, пренебрежимо на фоне `computeReorder` (O(allTasks)).

**Обоснование `sort: false`:** unplanned сортируется по `creationDate`; пользовательский reorder внутри него бессмыслен. Запрет на уровне библиотеки чище, чем визуальный no-op через `computeReorder`. Cross-list drag (из unplanned в день и обратно) не затрагивается.

### 3.3. TaskList.vue и TaskForm.vue — без изменений

Adapter обрабатывает `dueDate: null` → `id: 'unplanned'`, `sort: false`. Cross-day drop работает через общий `group: 'tasks'`.

### 3.4. E2E: добавить тест #6 (day → unplanned)

**Файл:** `e2e/dnd-characterization.spec.ts`

Добавить тест: seed задачи с dueDate, drag на `.task-list[data-due-date="unplanned"]`, ассерт на отсутствие в исходном дне и наличие в unplanned. Уплотнение исходного дня проверяется через порядок оставшихся задач.

При добавлении теста обновить нумерацию во всех ссылках плана (фаза 2.4, фаза 3, фаза 4, фаза 5) и в комментариях spec-файла.

### 3.5. Ручной smoke-check month-view

Проверить вручную после реализации:
- Cross-day drop в month-view работает
- Drop из unplanned в день month-view работает
- Mini-карточки корректно отображают placeholder/overlay

Year-view использует `CalendarMonth` с `minimized=true` — slot не рендерится (`CalendarDay.vue:30`), DnD отсутствует. Smoke-check не требуется.

### Критерий

- E2E-тесты #1, #2, #5, #6 зелёные
- E2E-тесты #3, #4 остаются красными (исправляются в фазе 4)
- Unit-тесты `computeReorder` (все группы) без изменений
- Unit-тесты store (`task.spec.ts`) без изменений
- Ручной smoke-check month-view пройден
- `pnpm check` + `pnpm test:unit` зелёные

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

### 4.5. Решения, принятые при реализации фазы 4

- **F4-1. Гибридный ActionArea через единый `useDropZone`.** Нативные HTML5 drag events не генерируются во время vue-dnd-kit drag. Toggle-period zone тоже идёт через `makeDroppable`: без `id` — синтетический id `'action-area-hover'`, emit `enter` через `onDragEnter` callback.
- **F4-2. `accept: '*'` вместо `accept: 'task'`.** Standalone droppable с `accept: 'task'` не принимал untyped sortable items. Все draggable в приложении — задачи, фильтрация не нужна.
- **F4-3. `e.active.ids[0]` вместо `e.active.id`.** Документация указывает `e.active.ids` (массив).
- **F4-4. E2E: `:not([data-dnd-placeholder])` в селекторах.** Placeholder имеет тот же `data-task-id`; strict mode Playwright падает. Атрибут `data-dnd-placeholder` — публичный API библиотеки.
- **F4-5. Emit `enter` без аргументов.** `onDragEnter` callback библиотеки не даёт `DragEvent`; CalendarHeader не использовал аргумент.

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
| `v-for :key="index"` → stale list id | ~~Высокая~~ Решено | F3-1: `:key="formatDateISO(dayDate)"` на CalendarDay |
| `id` read-once + component reuse | ~~Средняя~~ Решено | F3-1: remount при смене даты; F3-2: `e.result` вместо `e.to.index` |
| Adapter слишком тонкий → утечка library API | Низкая | Code review на каждой фазе; grep на импорты |
| Bus factor 1 у vue-dnd-kit | Средняя | Adapter-слой локализует зависимость; замена библиотеки = переписать 4 файла |
| Playwright touch-drag не работает | Высокая | Touch тестируем только в Chromium + CDP; для остальных — unit-тесты активации |

---

## Критерии завершения

- [ ] Pre-step: (отменён — см. O-1)
- [x] Фаза 0: `@vue-dnd-kit/core` установлен; `docs/testing.md` обновлён; 5 characterization-тестов зелёные на HTML5 (решения и отклонения — раздел 0.4)
- [x] Фаза 1: Adapter-слой в `src/composables/dnd/`; `pnpm check` зелёный; ноль импортов библиотеки вне adapter
- [x] Фаза 2: Пилот (reorder внутри дня) работает; unit-тесты `computeReorder` и store без изменений; e2e #2 зелёный
- [x] Фаза 3: Cross-day и unplanned работают; e2e #1, #2, #5, #6 зелёные; #3, #4 красные (до фазы 4); unit-тесты computeReorder и store без изменений; month-view smoke-check пройден
- [x] Фаза 4: Action zones (корзина) работают; `movingItemId` удалён из store; e2e #3, #4 зелёные (решения и отклонения — раздел 4.5)
- [ ] Фаза 5: `dragTask()` переписан на pointer; mid-drag ассерты; keyboard-drag сценарий; все 5 e2e зелёные в обеих модах

---

## Открытые вопросы (возврат после пилота)

### O-1. `:key="index"` в CalendarWeek/CalendarMonth и read-once `id` у `makeSortableList`

**Статус:** решено (2026-11-10). Решение: `:key="formatDateISO(dayDate)"` на `<CalendarDay>` (см. F3-1 в фазе 3).

**Обоснование выбора:** remount при смене даты устраняет stale list ID и stale closure в onDrop по конструкции; соответствует дизайну библиотеки (`id` read-once); нулевые изменения в adapter; автоматически защищает будущий day-header droppable в фазе 4. Альтернатива (UUID + Map/getter) отвергнута как более сложная, хрупкая и не дающая преимуществ при реальных размерах данных.

---

## Ссылки

- Skill: `.kilo/skills/vue-dnd-kit/SKILL.md`
- References: `.kilo/skills/vue-dnd-kit/references/` (sortable.md, draggable-droppable.md, pitfalls.md)
- Текущая реализация: `src/components/task/TaskItem.vue`, `src/components/tasks/TaskList.vue`, `src/components/action-area/ActionArea.vue`
- Алгоритм: `src/utils/task/reordering.ts`, `docs/task-reordering.md`
- Store: `src/stores/task.ts`, `src/stores/calendar.ts`
- E2E: `e2e/smoke.spec.ts`, `playwright.config.ts`
