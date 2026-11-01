# Этап 4: Calendar Core

**Сложность:** Высокая
**Блокирует:** Этап 5, 6
**Зависит от:** Этап 0, 2

---

## Задачи

1. Calendar Store или Composable (`src/stores/calendar.ts` или `src/composables/useCalendar.ts`)
   - State: date, period, movingItemId
   - Actions: setDate, setPeriod, setNextDate, setPreviousDate, setToday
   - Computed: isPeriodWeek, isPeriodMonth
2. CalendarHeader (`src/components/calendar-header/CalendarHeader.vue`)
   - Навигация (prev/next/today)
   - Period switcher (week/month/year)
   - Display текущего периода
3. CalendarPeriodControls (`src/components/calendar-period-controls/CalendarPeriodControls.vue`)
   - Переключение week/month/year
4. CalendarDateControls (`src/components/calendar-date-controls/CalendarDateControls.vue`)
   - Prev/Next кнопки
   - Today кнопка

---

## Решение: Store vs Composable

**Рекомендация:** использовать **composable** (`useCalendar`), так как:

- Calendar state локален для компонента calendar
- Не нужен доступ из произвольных компонентов вне calendar tree
- Легче тестировать и переиспользовать

Если позже понадобится глобальный доступ (например, drag-drop между разными view), можно поднять в store.

---

## UI-библиотеки для календаря

Календарь реализуется полностью как кастомный компонент. Готовые компоненты календаря из UI-библиотек не подходят, так как:

- Нужен custom grid layout (week/month/year views)
- DnD интеграция требует контроля над каждым днём
- Календарь в этом проекте — это task board, а не date picker

---

## Баги legacy

На этот этап багов из [реестра](./1793484623270-react-to-vue-migration.md) не назначено.

---

## Критерии завершения

- [ ] Calendar рендерится с текущей датой
- [ ] Переключение period работает
- [ ] Навигация prev/next/today работает
- [ ] Header показывает корректный период

---

→ [Этап 5: Calendar Views](./stage-5-calendar-views.md)
