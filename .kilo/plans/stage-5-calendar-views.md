# Этап 5: Calendar Views (Week/Month/Year)

**Сложность:** Высокая
**Блокирует:** Этап 6
**Зависит от:** Этап 4

---

## Задачи

1. CalendarDay (`src/components/calendar-day/CalendarDay.vue`)
   - Props: date, minimized
   - Slot для контента (задач)
   - Стилизация today/current month
2. CalendarWeek (`src/components/calendar-week/CalendarWeek.vue`)
   - 7 дней (пн-вс)
   - Рендер задач для каждого дня
3. CalendarMonth (`src/components/calendar-month/CalendarMonth.vue`)
   - 35 дней (5 недель)
   - Minimized режим для дней вне текущего месяца
4. CalendarYear (`src/components/calendar-year/CalendarYear.vue`)
   - 12 месяцев
   - Minimized режим

---

## Структура данных

- Использовать утилиты из Этапа 0 (`getWeekDayDates`, `getMonthWeekDates`, etc.)
- Каждая view получает date из calendar composable/store
- Задачи фильтруются по dueDate через store getter

---

## Баги legacy

Реализуются на этом этапе. Описание — в [индексе, реестр багов](./1793484623270-react-to-vue-migration.md).

| Баг | Что относится к этапу |
|-----|----------------------|
| B9 | Формат `dueDate` без zero-padding; формируется в CalendarWeek и CalendarMonth |

---

## Критерии завершения

- [ ] Week view показывает 7 дней с задачами
- [ ] Month view показывает сетку дней
- [ ] Year view показывает 12 месяцев
- [ ] Переключение между views работает
- [ ] Дни корректно стилизованы (today, other month)

---

→ [Этап 6: Drag-and-Drop](./stage-6-drag-and-drop.md)
