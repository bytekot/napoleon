# Этап 6: Drag-and-Drop

**Сложность:** Высокая
**Блокирует:** Финальная интеграция
**Зависит от:** Этап 3, 5

---

## Задачи

1. Draggable Task
   - `draggable="true"` на TaskItem
   - `@dragstart` — сохранить taskId и element
   - Visual feedback при перетаскивании
2. Drop Zones
   - CalendarDay как drop zone
   - `@dragover.prevent` — разрешить drop
   - `@drop` — изменить dueDate задачи
3. Reordering within day
   - Отслеживание позиции через `getDraggedTaskOrder`
   - Обновление order при drop
4. Optimistic updates
   - Немедленное обновление UI
   - Откат при ошибке API

---

## Native DnD vs Library

**Начать с Native HTML5 DnD**, так как:

- React версия использует native DnD
- Меньше зависимостей
- Достаточно для вертикального reordering

**Рассмотреть библиотеку** (SortableJS/vuedraggable), если:

- Потребуется complex multi-container drag
- Touch support станет приоритетом
- Native DnD окажется слишком ограниченным

---

## Баги legacy

Реализуются на этом этапе. Описание и код фиксов — в [индексе, реестр багов](./1793484623270-react-to-vue-migration.md).

| Баг | Что относится к этапу |
|-----|----------------------|
| B5 | Drop-хендлер: передача `dueDate: null` при drop в unplanned |
| B7 | Потребитель `getDraggedTaskOrder` |

---

## Критерии завершения

- [ ] Задачу можно перетащить из unplanned в день
- [ ] Задачу можно перетащить между днями
- [ ] Порядок задач сохраняется
- [ ] UI обновляется оптимистично
- [ ] API синхронизирует изменения

---

→ [Этап 7: MainPage и финальная интеграция](./stage-7-main-page-integration.md)
