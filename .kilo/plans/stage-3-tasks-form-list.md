# Этап 3: TasksForm и Tasks List

**Сложность:** Средняя
**Блокирует:** Этап 6
**Зависит от:** Этап 1, 2

---

## Задачи

1. TasksForm (`src/components/tasks-form/TasksForm.vue`)
   - Input для создания задачи
   - Обработка Enter для submit
   - Минимизация/развёртывание
2. TasksContainer (`src/components/tasks/TasksList.vue`)
   - Список задач (unplanned по умолчанию)
   - Empty state
3. TaskItem (`src/components/task/TaskItem.vue`)
   - Checkbox для completed
   - Drag handle (draggable атрибут)
   - Стилизация overdue/completed
4. Интеграция с store
   - `useTasksStore()` в компонентах
   - Создание задачи через `store.createTask()`

---

## Ключевые концепции Vue

- `v-model` для input binding
- `@keyup.enter` для обработки Enter
- `:class` для динамических классов (вместо classNames)
- Computed для фильтрации/сортировки (вместо useMemo)

---

## Баги legacy

Реализуются на этом этапе. Описание и код фиксов — в [индексе, реестр багов](./1793484623270-react-to-vue-migration.md).

| Баг | Что относится к этапу |
|-----|----------------------|
| B5 | Типизация prop `dueDate` |
| B6 | Обработка отсутствия задачи в компоненте |

---

## Критерии завершения

- [ ] Можно создать задачу (появляется в списке)
- [ ] Можно отметить задачу выполненной
- [ ] Unplanned задачи отображаются
- [ ] Визуальное сходство с React версией

---

→ [Этап 4: Calendar Core](./stage-4-calendar-core.md)
