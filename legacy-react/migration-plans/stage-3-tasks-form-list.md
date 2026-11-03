# Этап 3: TasksForm и Tasks List

**Сложность:** Средняя
**Блокирует:** Этап 6
**Зависит от:** Этап 1, 2

---

## Архитектурные решения

| Решение | Обоснование |
|---------|-------------|
| TasksForm = единый SFC-агрегатор | Включает TasksList внутри себя (как в legacy). Управляет состоянием формы через `ref()`, вызывает `useTasksStore().createTask()` напрямую. Без emit для create-task. |
| Нет container/component паттерна | Composition API + `<script setup>` заменяет разделение. Единый SFC для компонентов средней сложности. |
| Сортировка как в legacy | Unplanned: по `creationDate` (возрастание). С датой: по `order` (возрастание). Реализуется через computed/getter в store. |
| `dueDate: string \| null` | Запрет `undefined` на уровне типов. Unplanned = `null`. Фикс B5. |
| trim-gate при Enter | Задача создаётся, только если в имени есть непробельные символы (`taskName.trim()`). Улучшение относительно legacy: там проверка была truthy, имя из одних пробелов создавало задачу. Имя отправляется необрезанным (parity с legacy). Закреплено тестом TasksForm.spec. |
| B6 отложен в бэклог | Обработка отсутствующей задачи — предложение по улучшению, без фикса на этом этапе. Временное поведение: TaskItem рендерит пустой блок `data-task` (`v-if`-guard, crash исключён). Запись: [бэклог](../backlog/stage-3-improvements.md). |

---

## Задачи

### 1. TasksForm (`src/components/tasks-form/TasksForm.vue`)

Единый компонент-агрегатор, включает TasksList.

**Локальное состояние:**
- `taskName: ref('')` — текст input
- `minimized: ref(false)` — свёрнут/развёрнут

**Поведение:**
- Input с `v-model="taskName"` и `@keydown` (проверка `event.key === 'Enter'` в хендлере — как legacy `onKeyDown`)
- При Enter + `taskName` с непробельными символами (gate `taskName.trim()` — см. Архитектурные решения): вызов `store.createTask({ name: taskName, creationDate: new Date().toISOString() })` (имя не обрезается — parity с legacy), затем `taskName.value = ''`
- Фокус остаётся на input естественно (Enter не вызывает blur)
- Кнопка минимизации переключает `minimized`
- При `minimized`: видна только кнопка-иконка, скрываются заголовок, input и TasksList
- При развёрнутом состоянии: заголовок "Список дел", input, TasksList с `emptyText="Список пуст."`

**Интеграция:**
- `const store = useTasksStore()` напрямую в `<script setup>`
- Передаёт `dueDate: null` в TasksList (unplanned)

### 2. TasksList (`src/components/tasks/TasksList.vue`)

**Props:**
```ts
interface Props {
  dueDate: string | null  // null = unplanned
  emptyText?: string
}
```

**Поведение:**
- Получает задачи из store через getter/computed с фильтрацией по `dueDate`
- Сортировка: unplanned по `creationDate`, с датой по `order` (оба — возрастание)
- Empty state: текст из prop `emptyText` (по умолчанию "Список пуст.")
- Loading state: "Загрузка..." при `store.request.status === 'pending'`
- Рендерит TaskItem для каждой задачи через `v-for`

### 3. TaskItem (`src/components/task/TaskItem.vue`)

**Props:**
```ts
interface Props {
  taskId: string
}
```

**Поведение:**
- Получает задачу из store через getter по `taskId`
- **B6 не фиксится:** если задача не найдена — компонент рендерит пустой блок `data-task` (`v-if="task"` guard, crash исключён). Временное поведение; углублённая обработка отложена в [бэклог](../backlog/stage-3-improvements.md)
- Checkbox: `:checked="task.completed"`, `@change` вызывает `store.editTask({ id: taskId, completed: target.checked })` (`target` — checkbox из события; как legacy `event.target.checked`)
- Текст задачи: `{{ task.name }}`
- `draggable` атрибут: `true` если `!task.completed` (DnD хендлеры — на Этапе 6)
- CSS классы через `:class`:
  - `completed` — если `task.completed`
  - `overdue` — если `!task.completed && task.dueDate && new Date(task.dueDate) < today` (сравнение без времени)

**Overdue логика:**
```ts
const now = new Date()
now.setHours(0, 0, 0, 0)
const isOverdue = computed(() => 
  !task.completed && 
  task.dueDate !== null && 
  new Date(task.dueDate) < now
)
```

### 4. Интеграция со store

- `useTasksStore()` в TasksForm и TasksList
- Создание: `store.createTask({ name, creationDate })`
- Редактирование completed: `store.editTask({ id, completed })`
- Getter для фильтрации/сортировки задач (реализуется в store на Этапе 1 или как computed в TasksList)

### 5. Интеграция в MainPage (`src/views/MainPage.vue`)

Частично и досрочно закрывает задачу 1 Этапа 7 — точка монтирования необходима для ручных проверок этого этапа.

- Внутри `Layout`: `<TasksForm class="tasks" />`
- `onMounted`: `void store.fetchTasks()` — однократный вызов; legacy-паттерн B4 (`useEffect` без массива зависимостей) не воспроизведён, в store guard `request.status !== 'idle'`
- Стили `.main-page` / `.tasks` — parity с legacy `pages/main/styles.module.scss`
- Calendar, роутинг и styling polish остаются на Этапе 7

---

## Баги legacy

| Баг | Статус на этом этапе | Детали |
|-----|---------------------|--------|
| B5 | **Фиксируется** | Тип `dueDate: string \| null` во всех props. Запрет `undefined`. |
| B6 | **Отложен в бэклог** | Предложение по улучшению, без фикса. Временное поведение: пустой блок `data-task` через `v-if`. Запись: [бэклог](../backlog/stage-3-improvements.md). |

Описание багов — в [индексе, реестр багов](./index.md).

---

## Тесты

Стратегия: test-after (согласно общему плану).

**Минимум для критериев:**
- TasksForm: unit-тест на очистку input после создания задачи
- TaskItem: shallow-render тест на CSS классы `completed` / `overdue`

---

## Критерии завершения

- [x] `pnpm check` проходит без ошибок (lint + format + type-check)
- [x] Базовые unit-тесты проходят
- [x] Ручная проверка: создать задачу → она появляется в unplanned списке
- [x] Ручная проверка: отметить задачу выполненной → стиль меняется (класс `completed`)
- [x] Ручная проверка: свернуть/развернуть форму → контент скрывается/показывается
- [x] DevTools (Pinia): store `tasks` — `entities` и `ids` в state обновляются корректно после создания/завершения
- [x] Unplanned задачи отсортированы по `creationDate` (возрастание)

---

→ [Этап 4: Calendar Core](./stage-4-calendar-core.md)
