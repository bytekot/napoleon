# Этап 5: Calendar Views (Week/Month/Year)

**Сложность:** Высокая  
**Блокирует:** Этап 6  
**Зависит от:** Этап 4  

---

## Принятые решения

| # | Решение | Обоснование |
|---|---------|-------------|
| 1 | **Единый SFC на каждую view** | Не используем container/component паттерн. Логика через computed props. Соответствует стилю предыдущих этапов. |
| 2 | **dueDate как строка с zero-padding** | TasksList уже принимает `string \| null`. Формат `"YYYY-MM-DD"` формируется через `formatDateISO()` во view-компонентах. Фикс бага B9. |
| 3 | **DnD emit готовится на этом этапе** | Компоненты принимают `@item-drag-start` emit. На Этапе 6 он будет подключён к `store.setMovingItem`. |
| 4 | **Calendar.vue динамически рендерит views** | В зависимости от `store.period` рендерится CalendarWeek, CalendarMonth или CalendarYear. |

---

## Задачи

### 5.1 Утилита форматирования даты (`src/utils/calendar.ts`)

Добавить функцию для формирования строки даты в формате `YYYY-MM-DD` с zero-padding (фикс B9):

```ts
export function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
```

**Тест:** `src/utils/__tests__/calendar.spec.ts`
- `formatDateISO(new Date(2026, 0, 5))` → `"2026-01-05"` (zero-padding месяца и дня)
- `formatDateISO(new Date(2026, 10, 15))` → `"2026-11-15"`

---

### 5.2 CalendarDay (`src/components/calendar-day/CalendarDay.vue`)

Базовый компонент дня календаря.

**Props:**
```ts
interface Props {
  date: Date
  minimized?: boolean
}
```

**Вычисляемые свойства:**
- `isToday`: `isToday(props.date)`
- `isCurrentMonth`: `isCurrentMonth(props.date)`
- `dayNumber`: `props.date.getDate()`

**Slots:**
- `default`: контент (задачи), рендерится только если `!minimized`

**Классы:**
- `.calendar-day` — базовый
- `.today` — если сегодня
- `.current-month` — если текущий месяц
- `.minimized` — если minimized режим

**Стили:** перенос из legacy `calendar-day/styles.module.scss` (класс `.calendarDay`).

**Эмиты:** отсутствуют.

---

### 5.3 CalendarWeek (`src/components/calendar-week/CalendarWeek.vue`)

Недельное представление календаря.

**Props:**
```ts
interface Props {
  date: Date
}
```

**Emits:**
```ts
const emit = defineEmits<{
  itemDragStart: [id: string, event: DragEvent]
}>()
```

**Вычисляемые свойства:**
- `weekDates`: `getWeekDayDates(props.date)` — массив из 7 дат (пн-вс)

**Структура:**
```vue
<time class="calendar-week">
  <CalendarDay
    v-for="(dayDate, index) in weekDates"
    :key="index"
    :date="dayDate"
    class="day"
  >
    <TasksList
      :due-date="formatDateISO(dayDate)"
      class="tasks"
      @item-drag-start="(id, event) => emit('itemDragStart', id, event)"
    />
  </CalendarDay>
</time>
```

**Стили:** перенос из legacy `calendar-week/styles.module.scss`.

---

### 5.4 CalendarMonth (`src/components/calendar-month/CalendarMonth.vue`)

Месячное представление календаря.

**Props:**
```ts
interface Props {
  date: Date
  minimized?: boolean
}
```

**Emits:**
```ts
const emit = defineEmits<{
  itemDragStart: [id: string, event: DragEvent]
}>()
```

**Вычисляемые свойства:**
- `monthDates`: `getCalendarMonthDates(props.date)` — массив из 35 дат (5 недель × 7 дней)
- `dateTime`: `getMonth(props.date)` — для атрибута `datetime`

**Структура:**
```vue
<time :datetime="dateTime" class="calendar-month" :class="{ minimized }">
  <div v-for="(day, index) in DAYS_OF_WEEK" :key="index" class="day-of-week">
    {{ day }}
  </div>
  <CalendarDay
    v-for="(dayDate, index) in monthDates"
    :key="index"
    :date="dayDate"
    class="day"
  >
    <TasksList
      :due-date="formatDateISO(dayDate)"
      class="tasks"
      @item-drag-start="(id, event) => emit('itemDragStart', id, event)"
    />
  </CalendarDay>
</time>
```

**Стили:** перенос из legacy `calendar-month/styles.module.scss`.

---

### 5.5 CalendarYear (`src/components/calendar-year/CalendarYear.vue`)

Годовое представление календаря.

**Props:**
```ts
interface Props {
  date: Date
}
```

**Вычисляемые свойства:**
- `yearMonths`: `getYearMonthDates(props.date)` — массив из 12 дат (по одному дню каждого месяца)

**Структура:**
```vue
<time class="calendar-year">
  <div v-for="(monthDate, index) in yearMonths" :key="index" class="container">
    <h2 class="header">{{ getMonthName(monthDate) }}</h2>
    <CalendarMonth
      :date="monthDate"
      :minimized="true"
      class="month"
    />
  </div>
</time>
```

**Примечание:** CalendarYear не передаёт `@item-drag-start`, так как в minimized режиме задачи не отображаются и DnD недоступен.

**Стили:** перенос из legacy `calendar-year/styles.module.scss`.

---

### 5.6 Обновление Calendar.vue (`src/components/calendar/Calendar.vue`)

Заменить placeholder view-area на динамический рендер views.

**Структура:**
```vue
<template>
  <div class="calendar">
    <CalendarHeader class="header" />
    <CalendarWeek
      v-if="store.isPeriodWeek"
      :date="store.date"
      class="view"
      @item-drag-start="onItemDragStart"
    />
    <CalendarMonth
      v-else-if="store.isPeriodMonth"
      :date="store.date"
      class="view"
      @item-drag-start="onItemDragStart"
    />
    <CalendarYear
      v-else-if="store.isPeriodYear"
      :date="store.date"
      class="view"
    />
  </div>
</template>
```

**Handler (заглушка для Этапа 6):**
```ts
function onItemDragStart(id: string, event: DragEvent) {
  // Будет реализовано на Этапе 6: store.setMovingItem({ id, element: event.target })
}
```

**Getter:** добавить `isPeriodYear` в calendar store (аналогично существующим `isPeriodWeek`, `isPeriodMonth`).

**Стили:** добавить `.view { flex: 1; }` (parity с legacy `.week/.month/.year { flex: 1 }`).

---

### 5.7 Обновление TasksList для поддержки DnD emit

Добавить emit объявление в TasksList.vue. На этом этапе только декларация интерфейса; реальная эмиссия от TaskItem начнётся на Этапе 6.

**Emits:**
```ts
defineEmits<{
  itemDragStart: [id: string, event: DragEvent]
}>()
```

---

## Баги legacy

| Баг | Что относится к этапу | Фикс |
|-----|----------------------|------|
| B9 | Формат `dueDate` без zero-padding | Функция `formatDateISO()` с `padStart(2, '0')` для месяца и дня |

---

## Критерии завершения

- [x] `formatDateISO` утилита создана и протестирована
- [x] CalendarDay рендерит день с корректными классами (today, current-month, minimized)
- [x] CalendarWeek показывает 7 дней с задачами
- [x] CalendarMonth показывает сетку 35 дней с заголовками дней недели
- [x] CalendarYear показывает 12 месяцев в minimized режиме
- [x] Calendar.vue динамически переключает views по period
- [x] DnD emit объявлен в компонентах (готов к использованию на Этапе 6)
- [x] `isPeriodYear` getter добавлен в calendar store
- [ ] Визуальное соответствие React версии при переключении period
- [x] Test-after для компонентов: рендер без ошибок, корректные CSS-классы (today, current-month, minimized), вычисляемые даты
- [x] `pnpm check` проходит (lint + format + type-check)
- [x] `pnpm build` проходит

---

## Порядок выполнения

1. Добавить `formatDateISO` в `utils/calendar.ts` + тест
2. Добавить `isPeriodYear` getter в `stores/calendar.ts` + тест
3. CalendarDay.vue + стили
4. CalendarWeek.vue + стили
5. CalendarMonth.vue + стили
6. CalendarYear.vue + стили
7. Обновить Calendar.vue (динамический рендер + handler-заглушка)
8. Обновить TasksList.vue (добавить emit объявление)
9. Test-after для компонентов (базовый набор: рендер, классы, даты)
10. `pnpm check` + `pnpm build`
11. Ручная визуальная проверка (dev:vue vs dev:react)

---

## Проверка

```bash
cd packages/vue-app
pnpm test:unit     # тесты утилит и store
pnpm check         # lint + format + type-check
pnpm build         # собирается
```

Ручная проверка: `pnpm dev:vue` (:5174) + `pnpm dev:react` (:5173) параллельно.
- Переключение period (неделя/месяц/год) меняет отображение
- Неделя показывает 7 колонок с задачами
- Месяц показывает сетку с днями недели
- Год показывает 12 мини-месяцев
- Today подсвечивается серым фоном
- Дни вне текущего месяца стилизованы иначе

---

→ [Этап 6: Drag-and-Drop](./stage-6-drag-and-drop.md)
