# Переупорядочивание задач при drag-and-drop

## Соглашения

| Параметр | Решение |
| --- | --- |
| Тип `order` | Integer, плотная нумерация `0..N-1` внутри каждого дня |
| Инвариант | У задачи с `dueDate != null` всегда `order != null`; «дырок» в нумерации дня нет |
| Unplanned (`dueDate = null`) | Не имеют `order` (`null`). DnD внутри unplanned — no-op (`sort: false`) |
| Атомарность | Одна транзакция SQLite на бэкенде (`PATCH /tasks`) |
| Frontend | Optimistic update с rollback на snapshot затронутых задач |

## Архитектура

Библиотека `@vue-dnd-kit/core` вычисляет позицию drop. Adapter интерпретирует результат:

```
onDrop(e) → buildReorderUpdates(e, dueDate) → store.applyReorder → PATCH
```

`e.result` (Map<listId, Task[]>) содержит новые массивы затронутых списков после drop.
`buildReorderUpdates` (`src/utils/task.ts`) формирует `ReorderUpdate[]`: пропускает
unplanned, добавляет `dueDate` только при cross-day.

## Защита инварианта `dueDate != null ⟹ order != null`

1. **Zod** (`api/src/schemas/task.schema.ts`): `batchEditSchema.superRefine()` требует
   пару dueDate/order при установке или сбросе даты.
2. **DB CHECK** (`api/src/db/schema.ts`): `CHECK(due_date IS NULL OR "order" IS NOT NULL)`.

## Optimistic update и откат

```
1. updates пуст → выход
2. snapshot затрагиваемых задач
3. немедленное применение к entities
4. PATCH /tasks
5. успех → ответ сервера перезаписывает entities
   ошибка → восстановление из snapshot + request.status = 'error'
```

## Покрытие тестами

- `src/utils/__tests__/task.spec.ts` — `diffOrders`, `buildReorderUpdates`
- `src/stores/__tests__/task.spec.ts` — optimistic update, rollback
- `e2e/dnd-characterization.spec.ts` — pointer (#1–#6) и keyboard (K1–K3)
- `api/src/schemas/__tests__/task.schema.spec.ts` — валидация инварианта
- `api/src/routes/__tests__/tasks.spec.ts` — CHECK-констрейнт
