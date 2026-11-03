# Этап 1: Task Store + API-слой

**Статус:** к реализации
**Сложность:** Средняя
**Зависит от:** Этап 0 (готов)
**Блокирует:** Этапы 3, 4, 5

---

## Объём этапа

1. API-слой `src/api/` — закрывает **B10, B11, B12**
2. Pinia store `src/stores/tasks.ts` — закрывает **B2, B3, B8**
3. Правки утилит, перенесённых на Этапе 0 — закрывает **B1, B7**
4. Типовые решения, определяющие API стора — **B5, B6**
5. Тесты (TDD) для утилит и стора

**Не входит в этап:** B4 (Этап 7), drop-хендлер B5 (Этап 6), обработка `undefined` в компонентах B6 (Этап 3), формат дат B9 (Этап 5).

---

## Задача 1.1: API-слой

### `src/api/client.ts`

```ts
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}/api${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
```

Закрывает: **B10** (URL из env, одно место), **B11** (`response.ok`), **B12** (заголовки один раз).

### `src/api/tasks.ts`

```ts
import { request } from './client'
import type { Task } from '../types/tasks'

export interface CreateTaskParams {
  name: string
  creationDate: string
}

export interface EditTaskParams {
  id: string
  dueDate?: string | null   // ← B5: null, не undefined
  order?: number | null
  completed?: boolean
}

// API возвращает массив, если сработал reordering, иначе один объект
export type EditTaskResponse = Task | Task[]

export const getTasks = () =>
  request<Task[]>('/tasks')

export const createTask = (params: CreateTaskParams) =>
  request<Task>('/task', { method: 'POST', body: JSON.stringify(params) })

export const editTask = ({ id, ...body }: EditTaskParams) =>
  request<EditTaskResponse>(`/task${id}`, { method: 'PATCH', body: JSON.stringify(body) })

export const deleteTask = (id: string) =>
  request<string>(`/task${id}`, { method: 'DELETE' })
```

> **Важно — не «исправлять»:** маршрут записан как `/task${id}` **без слэша**. Это соответствует роуту API `router.patch('/task:taskId')` в `api/src/index.js:32`. Выглядит как опечатка, но API заморожен — сохранять как есть.

> **B5, часть типизации:** `dueDate?: string | null`. Причина: `JSON.stringify` отбрасывает `undefined`, поэтому сервер никогда не получал команду очистить дату. `null` в JSON сохраняется, и `updateTask` на бэкенде корректно пишет `dueDate: null`.

### Опционально: `.env`

```
VITE_API_URL=http://localhost:3001
```

Не обязательно — fallback в `client.ts` покрывает локальную разработку.

---

## Задача 1.2: Тип статуса запроса

### `src/types/request.ts`

```ts
export type RequestState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'success' }
  | { status: 'error'; error: string }
```

Discriminated union. Поле `error` существует **только** при `status: 'error'`. Состояние `{ status: 'success', error: '...' }` непредставимо.

**Следствие для Pinia:** присваивать отдельное поле нельзя — только заменять объект целиком:

```ts
this.request = { status: 'pending' }              // ✓
this.request.status = 'pending'                   // ✗ ошибка TS
```

---

## Задача 1.3: Store `src/stores/tasks.ts`

```ts
import { defineStore } from 'pinia'
import * as api from '../api/tasks'
import type { Task } from '../types/tasks'
import type { RequestState } from '../types/request'

interface TasksState {
  entities: Record<string, Task>
  ids: string[]
  request: RequestState
}

function toMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error'
}

export const useTasksStore = defineStore('tasks', {
  state: (): TasksState => ({
    entities: {},
    ids: [],
    request: { status: 'idle' },
  }),

  getters: {
    // B6: честный тип — undefined возможен
    taskById: (state) => (id: string): Task | undefined => state.entities[id],

    unplannedTaskIds(state): string[] {
      return state.ids
        .filter(id => !state.entities[id]?.dueDate)
        .sort((a, b) =>
          new Date(state.entities[a].creationDate).getTime() -
          new Date(state.entities[b].creationDate).getTime()
        )
    },

    taskIdsByDueDate: (state) => (dueDate: string): string[] =>
      state.ids
        .filter(id => state.entities[id]?.dueDate === dueDate)
        .sort((a, b) =>
          (state.entities[a].order ?? 0) - (state.entities[b].order ?? 0)
        ),
  },

  actions: { /* см. ниже */ }
})
```

> **Примечание о кэшировании:** getters с аргументом (`taskById`, `taskIdsByDueDate`) в Pinia **не кэшируются** — это функции, возвращающие значение при каждом вызове. В legacy селекторы вели себя так же, регрессии нет. Если на Этапе 5 выяснится, что пересчёт в цикле по 35 дням заметен — оптимизировать через локальный `computed` в компоненте.

### `fetchTasks`

```ts
async fetchTasks() {
  if (this.request.status !== 'idle') return

  this.request = { status: 'pending' }

  try {
    const tasks = await api.getTasks()

    this.entities = Object.fromEntries(tasks.map(task => [task.id, task]))
    this.ids = tasks.map(task => task.id)
    this.request = { status: 'success' }
  } catch (error) {
    this.request = { status: 'error', error: toMessage(error) }
  }
}
```

**B2 — что не портируем:**

```ts
// legacy get-tasks.ts
if (!tasks?.length) {
    rejectWithValue('No tasks.')   // результат не возвращён — ветка мертва
}
return tasks
```

Пустой список — валидное состояние (`api/src/mock.js` стартует с `const tasks = []`), поэтому при каждом холодном запуске legacy попадал в эту ветку. Никакой специальной обработки не нужно: `entities = {}`, `ids = []`, `status: 'success'`. Ошибки сети и HTTP ловит `catch` через `ApiError`.

**Отклонение от legacy (осознанное):** условие пропуска записано как `request.status !== 'idle'`, а не как `!ids.length` в legacy. Причина: при пустом списке `ids.length === 0` остаётся навсегда, и legacy-условие разрешало повторный fetch на каждом маунте. Новый вариант — одна загрузка на сессию страницы.

### `createTask`

```ts
async createTask(params: api.CreateTaskParams) {
  const tempId = `temp-${crypto.randomUUID()}`

  this.entities[tempId] = {
    id: tempId,
    name: params.name,
    creationDate: params.creationDate,
    dueDate: null,
    order: null,
    completed: false,
  }
  this.ids.push(tempId)

  try {
    const task = await api.createTask(params)

    delete this.entities[tempId]
    this.ids = this.ids.map(id => id === tempId ? task.id : id)
    this.entities[task.id] = task
  } catch (error) {
    delete this.entities[tempId]
    this.ids = this.ids.filter(id => id !== tempId)
    this.request = { status: 'error', error: toMessage(error) }
  }
}
```

Отличия от legacy:

- Legacy создавал оптимистичную задачу как `{ id, name, creationDate, completed: false } as Task` — поля `dueDate` и `order` отсутствовали, `as Task` глушил ошибку типов. Здесь объект полный, приведение типа не нужно (в духе B6: не врать типами).
- Legacy удалял temp id и **добавлял новый в конец** `ids`. Здесь id заменяется на месте, позиция сохраняется.

### `editTask`

```ts
async editTask(params: api.EditTaskParams) {
  const previous = this.entities[params.id]
  if (!previous) return

  // B8: явная проверка типа вместо truthy
  this.entities[params.id] = typeof params.order === 'number'
    ? { ...previous, ...params, order: params.order - 0.5 }
    : { ...previous, ...params }

  try {
    const response = await api.editTask(params)

    // B3: ответ сервера применяется всегда
    if (Array.isArray(response)) {
      response.forEach(task => { this.entities[task.id] = task })
    } else {
      this.entities[response.id] = response
    }
  } catch (error) {
    this.entities[params.id] = previous
    this.request = { status: 'error', error: toMessage(error) }
  }
}
```

**B8** — legacy писал `if (params.order)`. При `order === 0` (drop на первую позицию) условие ложно, optimistic-смещение `- 0.5` пропускалось, задача визуально прыгала. `typeof === 'number'` покрывает ноль.

**B3** — legacy делал ранний выход:

```ts
.addCase(editTask.fulfilled, (state, { meta, payload }) => {
    if (meta.arg.completed) {
        return          // ← ответ сервера отбрасывается
    }
```

Из-за этого отметка выполнения никогда не сверялась с сервером. Здесь `payload` применяется всегда.

**Rollback добавлен** — в legacy при ошибке `editTask` оптимистичное изменение оставалось в силе.

> Смещение `order - 0.5` сохранено из legacy намеренно: оно ставляет перетаскиваемую задачу на целевую позицию до подтверждения сервера, после чего reordering-ответ (`Task[]`) выставляет финальные целые значения.

### `deleteTask`

```ts
async deleteTask(id: string) {
  const previous = this.entities[id]
  const previousIndex = this.ids.indexOf(id)

  if (!previous || previousIndex === -1) return

  delete this.entities[id]
  this.ids.splice(previousIndex, 1)

  try {
    await api.deleteTask(id)
  } catch (error) {
    this.entities[id] = previous
    this.ids.splice(previousIndex, 0, id)
    this.request = { status: 'error', error: toMessage(error) }
  }
}
```

Legacy удалял задачу в `.pending` и не восстанавливал при ошибке. Rollback добавлен.

---

## Задача 1.4: Правки утилит, перенесённых на Этапе 0

Оба файла уже лежат в `vue-app/src/utils/`. Правим на месте.

### `src/utils/calendar.ts` — B1

**Было:**
```ts
export function getThisMonday (now: Date): Date {
    const day = now.getDay()
    if (day === 1) return now
    const date = now.getDate()
    const month = now.getMonth()
    const year = now.getFullYear()
    return new Date(year, month, date - (day - 1))
}
```

Для воскресенья `getDay() === 0` → `date - (0 - 1)` = `date + 1` → понедельник **следующей** недели.

**Стало:**
```ts
export function getThisMonday (now: Date): Date {
    const day = now.getDay()
    const diff = day === 0 ? -6 : 1 - day

    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff)
}
```

**Семантика (подтверждена):** неделя начинается в понедельник, воскресенье принадлежит неделе, начавшейся 6 дней назад. Соответствует ISO 8601 и существующему `DAYS_OF_WEEK = ['пн', ..., 'вс']`.

Проверка: вс(0)→−6 · пн(1)→0 · вт(2)→−1 · сб(6)→−5

Одна правка чинит два view: `getWeekDayDates` (неделя) и `getCalendarMonthDates` (сетка месяца) обе вызывают `getThisMonday`.

### `src/utils/tasks.ts` — B7

**Было:**
```ts
function getNodeIndex (element: Element, nodes: NodeList): number | null {
    let order
    nodes.forEach((node, index) => {
        if (node === element) {
            order = index
            return          // ← forEach игнорирует return, обход не прерывается
        }
    })
    return order ?? null
}

export function getDraggedTaskOrder (element: Element, clientY: number): number {
    const tasksEl = element.closest('[data-tasks]')
    const taskEl = element.closest('[data-task]')
    if (tasksEl && taskEl) {
        const { y, height } = taskEl.getBoundingClientRect()
        const order = getNodeIndex(taskEl, tasksEl.childNodes) ?? 0   // ← childNodes
        return clientY < y + height / 2 ? order : order + 1
    }
    return tasksEl?.childElementCount ?? 0
}
```

Два дефекта: `childNodes` включает текстовые узлы (пробелы между элементами в разметке раздувают индекс), и `return` внутри коллбэка `forEach` не прерывает обход.

**Стало:**
```ts
function getNodeIndex (element: Element, nodes: HTMLCollection): number {
    return Array.from(nodes).indexOf(element)
}

export function getDraggedTaskOrder (element: Element, clientY: number): number {
    const tasksEl = element.closest('[data-tasks]')
    const taskEl = element.closest('[data-task]')

    if (!tasksEl) return 0

    if (taskEl) {
        const { y, height } = taskEl.getBoundingClientRect()
        const order = getNodeIndex(taskEl, tasksEl.children)

        return clientY < y + height / 2 ? order : order + 1
    }

    return tasksEl.childElementCount
}
```

`children` — только элементы. `Array.from(...).indexOf()` решает обе проблемы и убирает `null` из сигнатуры.

> Функция на этом этапе не имеет потребителя — он появится на Этапе 6 (`TasksList` drop-хендлер). Чиним сейчас, пока контекст свежий и пока пишутся тесты на утилиты.

---

## Задача 1.5: Тесты (TDD)

Инфраструктура готова: `vitest.config.ts`, `@vue/test-utils`, `jsdom`, скрипт `test:unit`. Устанавливать ничего не нужно.

**Порядок работы: сначала тест, потом реализация.**

### `src/utils/__tests__/calendar.spec.ts`

Ключевые кейсы для B1 (ноябрь 2026: 1-е — воскресенье, 2-е — понедельник, 7-е — суббота):

```ts
describe('getThisMonday', () => {
  it('для понедельника возвращает тот же день', () => {
    expect(getThisMonday(new Date(2026, 10, 2))).toEqual(new Date(2026, 10, 2))
  })

  it('для воскресенья возвращает понедельник предыдущей недели', () => {
    expect(getThisMonday(new Date(2026, 10, 1))).toEqual(new Date(2026, 9, 26))
  })

  it('для субботы возвращает понедельник текущей недели', () => {
    expect(getThisMonday(new Date(2026, 10, 7))).toEqual(new Date(2026, 10, 2))
  })
})

describe('getWeekDayDates', () => {
  it('для воскресенья возвращает неделю, начавшуюся 6 дней назад', () => {
    const dates = getWeekDayDates(new Date(2026, 10, 1))
    expect(dates).toHaveLength(7)
    expect(dates[0]).toEqual(new Date(2026, 9, 26))   // пн 26 окт
    expect(dates[6]).toEqual(new Date(2026, 10, 1))   // вс 1 ноя
  })
})
```

Остальные утилиты (`getDateWithOffset`, `getCalendarMonthDates`, `isToday`, `getMonthName`) — по одному-два кейса на функцию, включая переход через границу месяца/года.

### `src/utils/__tests__/tasks.spec.ts`

Регрессия на B7: контейнер с **текстовыми узлами между элементами** (имитация реальной разметки), проверка что индекс считается по элементам.

```ts
it('игнорирует текстовые узлы при расчёте позиции', () => {
  document.body.innerHTML = `
    <div data-tasks>
      <div data-task>A</div>
      <div data-task>B</div>
    </div>`
  const tasks = document.querySelector('[data-tasks]')!
  const second = tasks.children[1]

  second.getBoundingClientRect = () =>
    ({ y: 100, height: 20 }) as DOMRect

  // clientY в верхней половине → позиция 1, не 2
  expect(getDraggedTaskOrder(second, 105)).toBe(1)
})
```

Отдельно: кейс без `[data-tasks]` → `0`; кейс `clientY` в нижней половине → `order + 1`.

### `src/stores/__tests__/tasks.spec.ts`

Мок API-слоя: `vi.mock('../../api/tasks')`.

| Тест | Проверяет |
|------|-----------|
| `fetchTasks`: пустой ответ → `status: 'success'`, `ids: []` | **B2** |
| `fetchTasks`: повторный вызов не делает запрос | отклонение от legacy |
| `fetchTasks`: ошибка → `status: 'error'`, `error` содержит сообщение | **B11** |
| `createTask`: temp id появляется сразу | optimistic |
| `createTask`: temp id заменяется на серверный **на том же месте** | улучшение |
| `createTask`: при ошибке temp id удаляется | rollback |
| `editTask`: при `completed: true` ответ сервера применяется | **B3** |
| `editTask`: при `order: 0` смещение `-0.5` применяется | **B8** |
| `editTask`: ответ-массив обновляет все затронутые сущности | frozen API |
| `editTask`: при ошибке состояние откатывается | rollback |
| `deleteTask`: удаление оптимистичное, при ошибке — откат | rollback |
| `taskById`: несуществующий id → `undefined` | **B6** |
| `unplannedTaskIds`: сортировка по `creationDate`, только без `dueDate` | parity |
| `taskIdsByDueDate`: сортировка по `order`, `null` трактуется как `0` | parity |

---

## Критерии завершения

- [ ] `src/api/client.ts` и `src/api/tasks.ts` созданы, `fetch` в store отсутствует
- [ ] `src/types/request.ts` содержит `RequestState` как discriminated union
- [ ] `src/stores/tasks.ts` создан, все четыре action реализованы
- [ ] **B1** исправлен в `src/utils/calendar.ts`
- [ ] **B7** исправлен в `src/utils/tasks.ts`
- [ ] **B2, B3, B8** не воспроизведены в store
- [ ] **B5**: `dueDate` в `EditTaskParams` типизирован как `string | null`
- [ ] **B6**: `taskById` возвращает `Task | undefined`
- [ ] Все тесты из задачи 1.5 написаны и проходят
- [ ] `pnpm type-check` проходит
- [ ] `pnpm build` проходит

## Проверка

```bash
cd packages/vue-app
pnpm test:unit     # все тесты зелёные
pnpm type-check    # без ошибок
pnpm build         # собирается
```

Ручная проверка store возможна с Этапа 3, когда появится UI. До этого — только тесты.

---

## Следующий этап

→ [Этап 2: Layout и UI-база](./stage-2-layout-ui-base.md) (независим, можно параллельно)
→ [Этап 3: TasksForm и список задач](./stage-3-tasks-form-list.md)
