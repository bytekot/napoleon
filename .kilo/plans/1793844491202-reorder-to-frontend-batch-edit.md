# План: Миграция reorder-логики на фронтенд + batch-edit API

## Контекст

Текущая архитектура: фронтенд отправляет `{ id, dueDate, order }` на `PATCH /task/:id`, бэкенд вычисляет все сдвиги соседних тасков (50+ строк императивной логики в `updateTask`) и возвращает массив обновлённых задач. Это антипаттерн — UI-логика живёт на сервере, API контракт полиморфен (`Task | Task[]`), перенос в DB ломает семантику мутации in-place.

**Цель:** Перенести вычисление reorder-сдвигов на фронтенд (Pinia store), заменить `PATCH /task/:id` на универсальный `POST /tasks/edit` с batch-update в транзакции. Бэкенд становится тривиальным — цикл update-ов в транзакции + `.returning()`.

## Принятые решения

| Решение | Выбор |
|---------|-------|
| Судьба `PATCH /task/:id` | Удалить полностью |
| Где reorder-логика | В Pinia store (`useTaskStore`) |
| Тесты | Unit-тесты на reorder-функцию на фронте |
| Скоуп миграции | Полная (бэкенд + фронтенд в одном плане) |
| Новый endpoint | `POST /tasks/edit` — принимает массив `{ id, ...fields }[]` |

---

## Задачи

### 1. Написать unit-тесты на reorder-логику (фронтенд)

Создать `src/utils/__tests__/computeReorder.spec.ts`.

Функция `computeReorder(tasks, movedTaskId, newDueDate, newPosition)` → `EditTaskPayload[]`.

**Тестовые кейсы** (по оригинальной логике `updateTask` из `api-backup/src/utils.js`):

#### Cross-date move (дата изменилась)
- [ ] Таск перемещён на новую дату → таски на новой дате с `order >= newOrder` сдвигаются +1
- [ ] Таск перемещён на новую дату → таски на старой дате с `order > oldOrder` сдвигаются -1
- [ ] Таск перемещён на новую дату → сам таск получает новые `dueDate` и `order`
- [ ] Нет тасков на старой/новой дате кроме перемещаемого → только сам таск обновляется

#### Same-date reorder (дата не изменилась)
- [ ] Таск сдвинут вперёд (oldOrder < newOrder) → таски в диапазоне `(oldOrder, newOrder]` сдвигаются -1
- [ ] Таск сдвинут назад (oldOrder > newOrder) → таски в диапазоне `[newOrder, oldOrder)` сдвигаются +1
- [ ] Таск остался на той же позиции → никаких сдвигов, только сам таск (или пустой результат)

#### Edge cases
- [ ] `order === null` у перемещаемого таска (был unplanned, получил дату)
- [ ] `order === null` у соседних тасков → они пропускаются (не сдвигаются)
- [ ] Перемещение в пустую дату → только сам таск, order = 0
- [ ] Перемещение unplanned → unplanned (без даты) → нет reorder-логики
- [ ] Один таск в списке → только сам таск обновляется

Входные данные для тестов: массив `Task[]` (полный список или отфильтрованный по дате). Функция чистая, без side effects.

### 2. Реализовать `computeReorder` на фронтенде

Создать `src/utils/tasks.ts` (добавить к существующему файлу) или `src/utils/reorder.ts`:

```typescript
export interface ReorderUpdate {
  id: string
  order: number
  dueDate?: string | null
}

export function computeReorder(
  allTasks: Task[],
  movedTaskId: string,
  newDueDate: string | null,
  newPosition: number,
): ReorderUpdate[]
```

Логика:
1. Найти перемещаемый таск, запомнить `oldDueDate`, `oldOrder`
2. Если `newDueDate === null` → вернуть только `[{ id, order: null, dueDate: null }]` (unplanned, без reorder)
3. Определить, изменилась ли дата (`oldDueDate !== newDueDate`)
4. **Date changed:**
   - Собрать таски на `newDueDate` с `order >= newPosition` → сдвиг +1
   - Собрать таски на `oldDueDate` с `order > oldOrder` → сдвиг -1
   - Добавить сам таск с `{ id, dueDate: newDueDate, order: newPosition }`
5. **Same date:**
   - oldOrder < newPosition → таски в `(oldOrder, newPosition]` сдвиг -1
   - oldOrder > newPosition → таски в `[newPosition, oldOrder)` сдвиг +1
   - Добавить сам таск
6. Вернуть массив всех обновлений (включая сам таск)

Пропускать таски с `order === null` при сдвигах.

### 3. Обновить Pinia store

В `src/stores/task.ts`:

- Переименовать `editTask` → `editTasks` (принимает массив)
- Добавить метод `reorderTask(taskId, newDueDate, newPosition)`:
  1. Берёт `Object.values(this.entities)` как полный список тасков
  2. Вызывает `computeReorder(allTasks, taskId, newDueDate, newPosition)`
  3. Применяет optimistic update ко всем затронутым таскам
  4. Отправляет batch на `POST /tasks/edit`
  5. При успехе → заменяет entities из response
  6. При ошибке → rollback всех затронутых тасков

Сохранить простой `editTask(params)` для toggle completed (без reorder), который тоже идёт через `POST /tasks/edit` но с одним элементом.

### 4. Обновить API клиент

В `src/api/tasks.ts`:

- Удалить `editTask()`
- Добавить `editTasks(updates: EditTaskPayload[])`:
  ```typescript
  export const editTasks = (updates: { id: string; [key: string]: unknown }[]) =>
    request<Task[]>('/tasks/edit', { method: 'POST', body: JSON.stringify({ tasks: updates }) })
  ```
- Тип ответа всегда `Task[]` (не полиморфный)

### 5. Обновить компоненты

**`src/components/tasks/TaskList.vue`:**
- `onDrop`: вместо `store.editTask({ id, dueDate, order })` → `store.reorderTask(id, props.dueDate, position.value)`

**`src/components/task/TaskItem.vue`:**
- Toggle completed: вместо `store.editTask({ id, completed })` → `store.editTask({ id, completed })` (простой метод остаётся)

### 6. Реализовать `POST /tasks/edit` на бэкенде

В `api/src/routes/tasks.ts`:

```typescript
taskRoutes.post('/tasks/edit', async (c) => {
  const body = await c.req.json()
  // validate: z.array(z.object({ id: z.string(), ... }).min(1)
  
  const updatedTasks = await db.transaction(async (tx) => {
    const result: Task[] = []
    for (const update of body.tasks) {
      const [updated] = await tx.update(tasks)
        .set(update)
        .where(eq(tasks.id, update.id))
        .returning()
      if (updated) result.push(updated)
    }
    return result
  })
  
  return c.json(updatedTasks)
})
```

Schema validation:
```typescript
const batchEditSchema = z.object({
  tasks: z.array(z.object({
    id: z.string().min(1),
    dueDate: z.string().nullable().optional(),
    order: z.number().nullable().optional(),
    completed: z.boolean().optional(),
    name: z.string().min(1).optional(),
  })).min(1),
})
```

### 7. Удалить `PATCH /task/:id`

Удалить весь route handler из `api/src/routes/tasks.ts`. Удалить `editTaskSchema` если больше не используется (заменить на `batchEditSchema`).

### 8. Обновить типы

- `src/types/tasks.ts`: убедиться что `Task` интерфейс корректен
- `src/api/tasks.ts`: удалить `EditTaskResponse = Task | Task[]`, заменить на `Task[]`
- Убрать полиморфную проверку `Array.isArray(response)` из store

---

## Порядок выполнения

```
1 → 2 → 3 → 4 → 5 → 6 → 7 → 8
│       │               │
└─ тесты ┘               └─ можно параллельно с 3-5
```

1. Тесты на `computeReorder` (спецификация поведения)
2. Реализация `computeReorder` (прохождение тестов)
3-5. Фронтенд миграция (store, api, components)
6-7. Бэкенд (новый endpoint + удаление старого)
8. Типы и cleanup

После каждого этапа: `pnpm check` (lint + format + type-check).

## Риски

| Риск | Митигация |
|------|-----------|
| Расхождение новой reorder-логики с оригиналом | Тесты из п.1 — спецификация. Все кейсы из utils.js покрыты |
| Optimistic update рассинхрон с сервером | Rollback в store; `.returning()` для reconciliation |
| Null order/dueDate edge cases | Явные проверки в `computeReorder`; отдельные тест-кейсы |
| Breaking change API | Фронтенд и бэкенд мигрируются вместе, нет промежуточного состояния |

## Валидация

1. `pnpm test:unit` — все тесты `computeReorder` проходят
2. `pnpm check` — lint + format + type-check без ошибок
3. Ручная проверка: drag-and-drop между днями, внутри дня, toggle completed
4. Проверка rollback: остановить API, сделать drag-and-drop → UI должен вернуться к предыдущему состоянию
