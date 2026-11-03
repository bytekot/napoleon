# Этап 4: Calendar Core

**Сложность:** Высокая
**Блокирует:** Этап 5, 6
**Зависит от:** Этап 0 (готов), 2 (готов)

---

## Принятые решения

| # | Решение | Обоснование |
|---|---------|-------------|
| 1 | **Pinia store `useCalendarStore`** (`src/stores/calendar.ts`) | Best practice Vue 3; единообразие с tasks store; devtools. Drag из unplanned-списка будет активировать dndMode/trash в header — исправление legacy-недоработки (подтверждено пользователем). |
| 2 | **movingItemId / setMovingItem отложены до Этапа 6** | Нет потребителя на Этапе 4; чёткое разделение ответственности. State Этапа 4 = только `date` + `period`. |
| 3 | **ActionArea.vue как presentational-компонент** | Создаётся на Этапе 4 (стили + slot, без DnD-хендлеров). CalendarHeader рендерит его для layout-parity (flex:1 spacer). DnD-поведение подключается на Этапе 6. |
| 4 | **Calendar.vue создаётся на Этапе 4 и монтируется в MainPage** | Header + пустой view-area (placeholder для views Этапа 5). Прецедент Этапа 3: досрочное монтирование для ручной проверки. |
| 5 | **TDD для store, test-after для компонентов** | Соответствует решению №4 из [индекса](./index.md): TDD для stores, test-after для компонентов. |

---

## Задачи

### 4.1 Store `src/stores/calendar.ts` (TDD)

```ts
import { defineStore } from 'pinia'
import { CALENDAR_PERIODS } from '../constants/calendar'
import type { CalendarPeriod } from '../types/calendar'
import { getDateWithOffset } from '../utils/calendar'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    date: new Date(),
    period: CALENDAR_PERIODS.week as CalendarPeriod,
  }),

  getters: {
    isPeriodWeek: (state) => state.period === CALENDAR_PERIODS.week,
    isPeriodMonth: (state) => state.period === CALENDAR_PERIODS.month,
  },

  actions: {
    setDate(date: Date) {
      this.date = date
    },

    setPeriod(period: CalendarPeriod) {
      this.period = period
    },

    setNextDate() {
      this.date = getDateWithOffset(this.date, this.period, 1)
    },

    setPreviousDate() {
      this.date = getDateWithOffset(this.date, this.period, -1)
    },

    setToday() {
      this.date = new Date()
    },
  },
})
```

#### Тесты `src/stores/__tests__/calendar.spec.ts` (TDD — сначала тесты, потом реализация)

| Тест | Проверяет |
|------|-----------|
| Начальное состояние: `date` ≈ now, `period === 'week'` | Defaults |
| `setDate(new Date(2026, 0, 15))` → `date` обновлён | setDate |
| `setPeriod('month')` → `period === 'month'`, `isPeriodMonth === true`, `isPeriodWeek === false` | setPeriod + getters |
| `setNextDate` при `period='week'`: date += 7 дней | Навигация week |
| `setNextDate` при `period='month'`: month += 1 | Навигация month |
| `setNextDate` при `period='year'`: year += 1 | Навигация year |
| `setPreviousDate` при `period='week'`: date -= 7 дней | Обратная навигация |
| `setPreviousDate` через границу месяца (31 янв → 24 янв при week) | Границы |
| `setToday` → `date.toDateString() === new Date().toDateString()` | setToday |

Мок времени не требуется — сравниваем относительные сдвиги через `getDateWithOffset`.

---

### 4.2 ActionArea (`src/components/action-area/ActionArea.vue`)

Presentational-компонент. Перенос стилей из legacy `action-area/styles.module.scss`.

**Props:**
```ts
interface Props {
  dangerous?: boolean   // класс .dangerous (красный фон)
}
```

**Slots:** default (иконка или контент).

**Эмиты:** отсутствуют на Этапе 4. DnD-события (`@dragenter`, `@dragleave`, `@drop`) добавляются на Этапе 6.

**Стили:** `<style scoped lang="scss">` — перенос из legacy `.actionArea`, `.dangerous`. Класс `.active` (hover-state при drag) добавляется на Этапе 6.

---

### 4.3 CalendarPeriodControls (`src/components/calendar-period-controls/CalendarPeriodControls.vue`)

**Поведение:**
- Три кнопки: «Неделя», «Месяц», «Год»
- Клик → `store.setPeriod(CALENDAR_PERIODS.week | .month | .year)`
- Активный период **не выделяется** (parity с legacy)

**Интеграция:** `const store = useCalendarStore()` напрямую в `<script setup>` (precedent Этапа 3: компоненты вызывают store напрямую).

**Стили:** перенос из legacy `calendar-period-controls/styles.module.scss`. Кнопки используют `Button.vue`.

---

### 4.4 CalendarDateControls (`src/components/calendar-date-controls/CalendarDateControls.vue`)

**Поведение:**
- Кнопка «←» → `store.setPreviousDate()`
- Кнопка «Сегодня» → `store.setToday()`
- Кнопка «→» → `store.setNextDate()`

**Иконки:** `CaretLeft.vue`, `CaretRight.vue` (уже перенесены на Этапе 2).

**Интеграция:** `const store = useCalendarStore()` напрямую.

**Стили:** перенос из legacy `calendar-date-controls/styles.module.scss`.

---

### 4.5 CalendarHeader (`src/components/calendar-header/CalendarHeader.vue`)

**Структура (parity с legacy):**
```
<div class="calendar-header">
  <h1>{{ headerText }}</h1>
  <ActionArea class="action-toggle-period">
    <CaretUpIcon size="medium" />
  </ActionArea>
  <ActionArea class="action-delete" dangerous>
    <TrashIcon size="medium" />
  </ActionArea>
  <CalendarPeriodControls class="period-controls" />
  <CalendarDateControls class="date-controls" />
</div>
```

**headerText:** вычисляется внутри компонента: `${getMonthName(store.date)} ${store.date.getFullYear()}` (утилита `getMonthName` уже есть из Этапа 0).

**Класс `dndMode`:** отсутствует на Этапе 4 (зависит от `movingItemId`, который появится на Этапе 6). ActionArea-элементы имеют `opacity: 0` / `display: none` по умолчанию (из legacy CSS), поэтому визуально header идентичен legacy в обычном режиме.

**Стили:** перенос из legacy `calendar-header/styles.module.scss`. Секция `&.dndMode` переносится, но не активируется до Этапа 6.

---

### 4.6 Calendar (`src/components/calendar/Calendar.vue`)

Корневой компонент календаря.

**Структура:**
```vue
<template>
  <div class="calendar">
    <CalendarHeader class="header" />
    <!-- View area: placeholder для Этапа 5 -->
    <div class="view-area" />
  </div>
</template>
```

На Этапе 5 view-area будет заменена на динамический рендер Week/Month/Year views в зависимости от `store.period`.

**Стили:** перенос из legacy `calendar/styles.module.scss` (`.calendar`, `.header`, `.week/.month/.year` flex-правила).

---

### 4.7 Монтирование в MainPage (`src/views/MainPage.vue`)

Добавить Calendar рядом с TasksForm (частично закрывает задачу 1 Этапа 7, precedent Этапа 3):

```vue
<template>
  <Layout>
    <div class="main-page">
      <TasksForm class="tasks" />
      <Calendar class="calendar" />
    </div>
  </Layout>
</template>
```

**Стили:** добавить `.calendar { flex: 1; }` в `.main-page` (parity с legacy `pages/main/styles.module.scss`).

---

## UI-библиотеки для календаря

Календарь реализуется полностью как кастомный компонент. Готовые компоненты календаря из UI-библиотек не подходят, так как:

- Нужен custom grid layout (week/month/year views)
- DnD интеграция требует контроля над каждым днём
- Календарь в этом проекте — это task board, а не date picker

---

## Баги legacy

На этот этап багов из [реестра](./index.md) не назначено.

**Примечание:** `getDateWithOffset` имеет известную проблему с переполнением месяцев (31 янв + 1 месяц → 3 мар). Это не внесено в реестр; parity с legacy сохраняется. Если потребуется фикс — отдельное решение.

---

## Критерии завершения

- [x] `useCalendarStore` создан, все actions/getters работают
- [x] TDD-тесты store написаны и проходят
- [x] ActionArea.vue создан (presentational, стили + slot)
- [x] CalendarPeriodControls переключает period
- [x] CalendarDateControls: prev/next/today работают
- [x] CalendarHeader показывает корректный текст периода
- [x] Calendar.vue рендерится с header и пустым view-area
- [x] Calendar смонтирован в MainPage рядом с TasksForm
- [x] Визуальное соответствие React версии (header layout, controls)
- [x] Test-after минимум для компонентов (header рендерит текст, controls вызывают actions)
- [x] `pnpm check` проходит (lint + format + type-check)
- [x] `pnpm build` проходит

## Проверка

```bash
cd packages/vue-app
pnpm test:unit     # TDD-тесты store зелёные
pnpm check         # lint + format + type-check
pnpm build         # собирается
```

Ручная проверка: `pnpm dev:vue` (:5174) + `pnpm dev:react` (:5173) параллельно. Навигация prev/next/today меняет header text. Переключение period меняет шаг навигации.

---

## Порядок выполнения

1. TDD: написать тесты `calendar.spec.ts` (красные)
2. Реализовать `useCalendarStore` (зелёные тесты)
3. ActionArea.vue (presentational)
4. CalendarPeriodControls.vue
5. CalendarDateControls.vue
6. CalendarHeader.vue
7. Calendar.vue
8. Монтирование в MainPage
9. Test-after для компонентов
10. `pnpm check` + `pnpm build`
11. Ручная визуальная проверка

---

→ [Этап 5: Calendar Views](./stage-5-calendar-views.md)
