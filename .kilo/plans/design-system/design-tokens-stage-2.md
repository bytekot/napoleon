# Этап 2: Миграция на визуальный язык мокапа

## Цель

Обновить primitive-слой токенов и семантические значения согласно мокапу `.kilo/plans/design-system/mockup.png`, сохраняя архитектуру из Этапа 1. Добавить скевоморфические эффекты, систематизировать spacing по сетке 8px, внедрить monospaced шрифт для цифр календаря.

**Принцип:** Мокап — референс, не догма. Сохраняем элементы скевоморфизма (объёмные кнопки, вогнутые инпуты, "бумажные" карточки, высеченные сепараторы).

---

## Зафиксированные решения

| # | Решение |
|---|---------|
| 1 | Файл токенов: `src/styles/theme.scss` (production, только активные значения) |
| 2 | Файл альтернатив: `.kilo/plans/design-system/token-alternatives.md` (playground, все варианты) |
| 3 | Три слоя сохранены: primitive → semantic → component |
| 4 | Spacing: сетка 8px, именование `xxs`/`xs`/`s`/`m`/`l`/`xl`/`2xl`/`3xl` |
| 5 | Все semantic-токены ссылаются на primitive через `var()` (включая shorthand) |
| 6 | Monospaced шрифт: `Roboto Mono` (подключение как Roboto, пока CDN) |
| 7 | Цветовая палитра: тёплые кремовые фоны + teal/green акценты + dark teal текст |
| 8 | Скевоморфизм: усиленные тени карточек, многослойные inset shadows для инпутов/сепараторов/кнопок |
| 9 | Кнопки: button group (toggle, активная остаётся зелёной) vs standalone (momentary, зелёная только в `:active`) |
| 10 | rem vs px: отдельный этап (Этап 2.5 или 3) |

---

## Primitive-токены (новые значения)

### Цвета

```scss
// Warm palette (фоны)
--color-warm-50: #f9f6f0;   // фон приложения, хедера
--color-warm-100: #f2efea;  // highlight (блик кнопок/сепараторов)
--color-warm-200: #e4e2dd;  // светлая тень (верх кнопок)
--color-warm-300: #d1cdca;  // тёмная тень (низ кнопок/сепараторов)

// Green palette (акценты, сайдбар)
--color-green-50: #e5f1e9;  // блик сепаратора формы
--color-green-100: #d5e5dd; // фон сайдбара
--color-green-150: #cbddd4; // тени сепаратора формы
--color-green-200: #b5c9c1; // середина сепаратора формы
--color-green-250: #b4c8bf; // середина вертикальной тени сайдбара
--color-green-600: #4c887e; // активная кнопка (pressed)
--color-green-700: #245e56; // тень активной кнопки

// Sidebar shadows
--color-sidebar-border: #b4c8bf;
--color-sidebar-shadow-left: #cfe0d8;
--color-sidebar-shadow-right: #d3ded7;
--color-sidebar-highlight: #fbfcf8;

// Ink palette (текст)
--color-ink-900: #062638;   // основной тёмный текст (заголовки, галочки)
// альтернатива (более тёмная): #012537

// Danger
--color-danger-soft: #f8a4a3; // просроченная полоска
// альтернатива (прежнее значение): rgba(255, 0, 0, 0.2)

// Card
--color-card-bg: #fefefe;   // фон карточки (чуть теплее чистого белого)

// Input borders (нижний бордер, 6 слоёв сверху вниз)
--color-input-border-bottom-1: #d8e8de;
--color-input-border-bottom-2: #bbd2c8;
--color-input-border-bottom-3: #afc8be; // основной визуальный
--color-input-border-bottom-4: #dbe9e2;
--color-input-border-bottom-5: #e7f2eb;
--color-input-border-bottom-6: #d1e2da;

// Input borders (верхний бордер, 5 слоёв + градиент)
--color-input-border-top-1: #dae8e0;
--color-input-border-top-2: #d0e3d9;
--color-input-border-top-3: #8daba0; // основной визуальный (тёмный)
--color-input-border-top-4: #9fbab0;
--color-input-border-top-5: #b5cac0; // начало градиента

// Button standalone (чуть темнее фона приложения)
--color-button-standalone-bg: #f1eee8;
--color-button-standalone-shadow-top: #dcdad5;
--color-button-standalone-shadow-bottom: #c9c5c2;
--color-button-standalone-highlight: #eae7e2;

// Button standalone hover (ещё темнее)
--color-button-standalone-bg-hover: #e9e6e0;
--color-button-standalone-shadow-top-hover: #d4d2cd;
--color-button-standalone-shadow-bottom-hover: #c1bdba;
```

### Spacing (сетка 8px)

```scss
--space-xxs: 4px;   // 0.5 × 8
--space-xs: 8px;    // 1 × 8
--space-s: 16px;    // 2 × 8
--space-m: 24px;    // 3 × 8
--space-l: 32px;    // 4 × 8
--space-xl: 40px;   // 5 × 8
--space-2xl: 48px;  // 6 × 8
--space-3xl: 64px;  // 8 × 8
```

### Typography

```scss
--font-family-base: Roboto, sans-serif;
--font-family-mono: 'Roboto Mono', monospace;
--font-family-calendar-numbers: var(--font-family-mono);
```

### Shadows

```scss
// Card (Вариант C: teal-оттенок под календарь)
// ПОМЕТКА: тень должна быть адаптивной — разной в календаре (#f9f6f0) и форме (#d5e5dd)
--shadow-card: 0 2px 8px rgba(6, 38, 56, 0.08), 0 1px 3px rgba(6, 38, 56, 0.05);
--shadow-card-hover: 0 4px 12px rgba(6, 38, 56, 0.12), 0 2px 6px rgba(6, 38, 56, 0.08);
--shadow-card-sidebar: 0 2px 8px rgba(76, 136, 126, 0.1), 0 1px 3px rgba(76, 136, 126, 0.06);

// Card completed (как сепаратор календаря, инвертирован)
--shadow-card-completed: 
  inset 0 1px 0 var(--color-warm-100),
  inset 0 -1px 0 var(--color-warm-300);

// Separator (форма задач, "высеченный")
--shadow-separator-inset: 
  inset 0 1px 0 var(--color-green-150),
  inset 0 -1px 0 var(--color-green-150),
  0 1px 0 var(--color-green-50);

// Sidebar (вертикальная тень)
--shadow-sidebar: 
  inset 1px 0 0 var(--color-sidebar-shadow-left),
  inset -1px 0 0 var(--color-sidebar-shadow-right),
  -2px 0 0 var(--color-sidebar-highlight);

// Input (Вариант B: адаптация текущего стиля)
--shadow-input-inset: 
  inset 1px 1px 2px 0 rgba(141, 171, 160, 0.3),
  inset -1px -1px 2px 0 rgba(216, 232, 222, 0.5),
  inset 0 -3px 0 0 var(--color-input-border-bottom-3);

// Button group inactive (скевоморфизм)
--shadow-button-group-inactive: 
  inset 0 1px 0 var(--color-warm-200),
  inset 0 -1px 0 var(--color-warm-300),
  inset 0 -2px 0 var(--color-warm-100);

// Button group active (pressed)
--shadow-button-group-active: 
  inset 0 1px 2px var(--color-green-700);

// Button standalone base
--shadow-button-standalone: 
  inset 0 1px 0 var(--color-button-standalone-shadow-top),
  inset 0 -1px 0 var(--color-button-standalone-shadow-bottom),
  inset 0 -2px 0 var(--color-button-standalone-highlight);

// Button standalone hover
--shadow-button-standalone-hover: 
  inset 0 1px 0 var(--color-button-standalone-shadow-top-hover),
  inset 0 -1px 0 var(--color-button-standalone-shadow-bottom-hover);

// Button standalone active (как pressed в группе)
--shadow-button-standalone-active: 
  inset 0 1px 2px var(--color-green-700);
```

---

## Semantic-токены (обновлённые значения)

### Colors

```scss
// Backgrounds
--color-bg-app: var(--color-warm-50);
--color-bg-surface: var(--color-card-bg);
--color-bg-sidebar: var(--color-green-100);
--color-bg-header: var(--color-warm-50);
--color-bg-controls: var(--color-warm-50);
--color-bg-input: var(--color-warm-50);
--color-bg-card: var(--color-card-bg);
--color-bg-card-hover: rgba(254, 254, 254, 0.93);
--color-bg-card-completed: var(--color-warm-50);
--color-bg-day-today: var(--color-warm-200);
--color-bg-month-cell: var(--color-warm-100);
--color-bg-action-area: var(--color-warm-200);
--color-bg-action-area-active: var(--color-warm-300);
--color-bg-checkmark: var(--color-card-bg);
--color-bg-checkmark-hover: var(--color-warm-100);
--color-bg-checkmark-checked: var(--color-warm-200);
--color-bg-danger: var(--color-danger-soft);
--color-bg-danger-active: rgba(248, 164, 163, 0.6);

// Text
--color-text-primary: var(--color-ink-900);
--color-text-secondary: var(--color-ink-900);
--color-text-input: var(--color-ink-900);
--color-text-day: rgba(6, 38, 56, 0.5);
--color-text-month-header: rgba(6, 38, 56, 0.6);
--color-text-action-area: var(--color-warm-50);
--color-text-button-active: var(--color-warm-50);

// Icons
--color-icon-default: var(--color-warm-100);
--color-icon-muted: var(--color-warm-300);

// Borders
--color-border-default: var(--color-warm-300);
--color-border-checkmark: var(--color-ink-900);

// Accent & Shadow
--color-accent-drag: #b3d4ff;
--color-shadow-base: rgba(6, 38, 56, 0.2);
```

### Spacing

```scss
--space-list: var(--space-xs);
--space-list-item-gap: var(--space-xs);
--space-card: var(--space-s);
--space-card-mini: var(--space-xxs) var(--space-s) var(--space-xxs);
--space-day: var(--space-xxs);
--space-controls: var(--space-xs);
--space-controls-gap: var(--space-xxs);
--space-header-title: var(--space-s);
--space-input: var(--space-xs);
--space-form-input: var(--space-xs);
--space-form-toggle: 0 0 0 var(--space-xs);
--space-form-toggle-minimized: var(--space-xs);
--space-form-icon-offset: var(--space-xs);
--space-form-header: var(--space-xs) var(--space-xs);
--space-checkmark-text: var(--space-l);
--space-action-area: var(--space-xxs) var(--space-s);
--space-button: 0 var(--space-xs);
--space-year-grid-gap: var(--space-xs) var(--space-3xl);
--space-year: var(--space-xs) var(--space-s);
--space-year-header: var(--space-xs) var(--space-xxs);
--space-month-dow: var(--space-xxs) var(--space-xxs);
--space-overdue-warning: var(--space-xxs);
```

### Typography

```scss
--font-size-heading: var(--font-size-20);
--font-size-day: var(--font-size-20);
--font-size-day-minimized: var(--font-size-14);
--font-size-input: var(--font-size-14);
--font-size-button: 13px;
--font-size-action-area: 32px;
--font-weight-heading: 100;
--letter-spacing-heading: 1px;
--letter-spacing-base: 0.01em;
--line-height-button: 16px;
--line-height-form-toggle: 35px;
```

### Radius

```scss
--radius-control: var(--radius-4);
--radius-card: var(--radius-10);
--radius-checkmark: var(--radius-30);
--radius-form-toggle: var(--radius-30);
--radius-button-group-first: 4px 0 0 4px;
--radius-button-group-last: 0 4px 4px 0;
```

### Sizing

```scss
--size-button-height: 29px;
--size-checkmark: 20px;
--size-check-mark-width: 5px;
--size-check-mark-height: 10px;
--size-overdue-stripe: 10px;
--size-icon-small: 16px;
--size-icon-medium: 32px;
--size-sidebar: 300px;
--size-sidebar-minimized: 30px;
--size-sidebar-max: 250px;
--size-input-height: 15px;
--size-input-width: 210px;
--size-period-button: 61px;
--size-delete-area: 200px;
--size-mini-task-height: 30px;
--size-mini-task-width: 170px;
--size-form-toggle-icon: 20px;
--size-month-dow-row: 30px;
```

### Motion

```scss
--transition-drag-indicator: var(--duration-base) all var(--ease-in-out);
--transition-action-area: var(--duration-fast) all var(--ease-default);
--transition-sidebar: var(--duration-base) all var(--ease-in);
--transition-card-completed: var(--duration-fast) all var(--ease-in);
--transition-header-dnd: var(--duration-base) all var(--ease-default);
```

---

## Component-токены (Button)

```scss
// Button Group (toggle: Неделя/Месяц/Год)
--button-group-bg-inactive: var(--color-warm-50);
--button-group-color-inactive: var(--color-ink-900);
--button-group-bg-active: var(--color-green-600);
--button-group-color-active: var(--color-warm-50);

// Button Standalone (momentary: стрелки, Сегодня)
--button-standalone-bg: var(--color-button-standalone-bg);
--button-standalone-color: var(--color-ink-900);
--button-standalone-bg-hover: var(--color-button-standalone-bg-hover);
--button-standalone-bg-active: var(--color-green-600);
--button-standalone-color-active: var(--color-warm-50);

// Legacy Button (TaskForm toggle, если оставляем серым)
--button-bg: linear-gradient(#f7f8fa, #e7e9ec);
--button-border-color: #adb1b8 #a2a6ac #8d9096;
--button-border-color-hover: #a2a6ac #979aa1 #82858a;
--button-border-color-active: #a2a6ac;
--button-color-focus-border: #e77600;
--button-shadow: rgba(255, 255, 255, 0.6) 0 1px 0 inset;
--button-shadow-focus: rgba(228, 121, 17, 0.5) 0 0 3px 2px;
```

---

## Порядок работ

### Фаза 1: Подготовка файлов

1. Создать `.kilo/plans/design-system/token-alternatives.md` с всеми вариантами теней/цветов
2. Обновить `src/styles/theme.scss`:
   - Удалить старые primitive-токены (neutral-*, space-5/10/20/30)
   - Добавить новые primitive-токены (warm-*, green-*, ink-*, space-xxs/xs/s/m/l/xl/2xl/3xl)
   - Обновить semantic-токены на новые значения
   - Добавить component-токены для button group/standalone
   - Подключить Roboto Mono (через `@import` в `index.scss` или `<link>` в `index.html`)

### Фаза 2: Применение в компонентах

1. **CalendarDay.vue:**
   - Применить `font-family: var(--font-family-calendar-numbers)` к `.date`
   - Обновить цвет текста на `var(--color-text-day)`

2. **CalendarYear.vue:**
   - Применить mono к месяцам
   - Обновить цвета фона/текста

3. **CalendarHeader.vue:**
   - Применить mono к году в заголовке
   - Обновить цвет текста на `var(--color-text-primary)`

4. **TaskForm.vue:**
   - Добавить `box-shadow: var(--shadow-separator-inset)` к `.header`
   - Добавить `box-shadow: var(--shadow-sidebar)` к `.task-form`
   - Обновить цвета фона/теней

5. **TaskItem.vue:**
   - Обновить `background: var(--color-bg-card)`
   - Обновить `box-shadow: var(--shadow-card)` (или `--shadow-card-sidebar` для сайдбара)
   - Обновить completed-состояние на `var(--shadow-card-completed)`
   - Обновить цвет галочки на `var(--color-border-checkmark)`

6. **TextArea.vue:**
   - Обновить `box-shadow: var(--shadow-input-inset)`
   - Обновить цвета фона/бордеров

7. **CalendarPeriodControls.vue:**
   - Реализовать button group логику:
     - Неактивная кнопка: `background: var(--button-group-bg-inactive)`, `box-shadow: var(--shadow-button-group-inactive)`
     - Активная кнопка: `background: var(--button-group-bg-active)`, `color: var(--button-group-color-active)`, `box-shadow: var(--shadow-button-group-active)`

8. **CalendarDateControls.vue:**
   - Реализовать standalone кнопку логику:
     - Базовое: `background: var(--button-standalone-bg)`, `box-shadow: var(--shadow-button-standalone)`
     - Hover: `background: var(--button-standalone-bg-hover)`, `box-shadow: var(--shadow-button-standalone-hover)`
     - Active: `background: var(--button-standalone-bg-active)`, `color: var(--button-standalone-color-active)`, `box-shadow: var(--shadow-button-standalone-active)`

9. **Button.vue:**
   - Решить: оставляем legacy серый стиль или переводим в зелёную палитру
   - Если переводим: обновить `--button-*` токены на зелёные значения

10. **Layout.vue:**
    - Обновить `background: var(--color-bg-app)`

11. **MainPage.vue:**
    - Без изменений (только max-width)

### Фаза 3: Валидация

1. `pnpm check` — зелёный
2. `pnpm test:unit` — зелёный
3. Визуальный smoke-test (`pnpm dev` + `pnpm start-server`):
   - **Цвета:** фон приложения (кремовый), сайдбар (мятный), карточки (белые с тенью)
   - **Тени:** карточки "бумажные", инпут вогнутый, сепаратор высеченный, кнопки объёмные
   - **Кнопки:** button group (Неделя зелёная постоянно), standalone (Сегодня зелёная только при нажатии)
   - **Hover/Active:** standalone кнопки темнеют при hover, зеленеют при active
   - **Monospaced:** цифры дней/месяцев/года в Roboto Mono
   - **Spacing:** визуальная ритмичность (все отступы кратны 8px)
   - **Completed задача:** фон как приложение, тень как сепаратор
   - **Просроченная задача:** мягкая красная полоска
   - **Чекмарк:** галочка тёмно-teal (`#062638`)
   - **Сравнение с мокапом:** общее соответствие (цвета, тени, объём)

4. Аудит grep:
   ```bash
   rg "#[0-9a-fA-F]{3,8}|rgba?\(" src/components src/styles
   ```
   Остаться должны только:
   - Значения внутри `theme.scss`
   - Задокументированные исключения (атрибуты BaseIcon)
   - Динамические значения в JS (если есть)

---

## Исключения (литералы остаются)

- `BaseIcon.vue:37-39` — атрибуты шаблона `width="32" height="32" fill="#000"` (presentation attributes не принимают `var()`)
- Значения `opacity` (0, 0.1, 0.3, 0.5, 0.8, 0.99, 1) — категория не согласована
- Структурные значения: `border-width`, `border-style`, `grid-template-columns`, позиции, `display`/`flex`/`overflow`
- Мёртвое правило `TaskItem.vue:183-185` (`.overdue .warning`) — токенизируется, но НЕ удаляется

---

## Риски

1. **Spacing-маппинг может сломать визуал:** некоторые значения (5px → 4px, 20px → 16px) могут изменить плотность layout. Нужен визуальный smoke-test после каждого изменения.

2. **Monospaced шрифт может изменить ширину элементов:** цифры в календаре могут стать шире/уже, потребуется корректировка grid/flex в CalendarMonth/CalendarYear.

3. **Новые тени могут конфликтовать с существующими:** особенно `--shadow-card-completed` (inset) vs новая объёмная тень `--shadow-card`. Нужно убедиться, что completed-карточки не выглядят "плоскими".

4. **Адаптивная тень карточки:** если реализуем разную тень для календаря и формы, нужно добавить prop или CSS-класс для переключения (`--shadow-card` vs `--shadow-card-sidebar`).

5. **Button group vs standalone:** нужна чёткая логика в компонентах, чтобы не перепутать состояния (toggle vs momentary).

6. **Roboto Mono загрузка:** если используем CDN, возможна задержка загрузки (FOUT). Локальный файл (запланирован на позже) решит проблему.

---

## Вне скоупа

- Этап 3: темы (`[data-theme]`, переключение)
- Переход на rem (отдельный этап)
- Изменение layout/composition (мокап сохраняет текущую структуру)
- Анимации/transition (если не связаны с новыми тенями)
- Чистка мёртвого кода
- Локальное размещение шрифтов (запланировано на позже)

---

## Открытые вопросы (для реализации)

1. **Адаптивная тень карточки:** как реализовать переключение между `--shadow-card` (календарь) и `--shadow-card-sidebar` (форма)?
   - Вариант A: CSS-класс `.card--sidebar`
   - Вариант B: prop в TaskItem (`<TaskItem :sidebar="true" />`)
   - Вариант C: CSS-контекст (`.task-form .task { box-shadow: var(--shadow-card-sidebar); }`)
   - **Рекомендация:** Вариант C (проще, не требует изменений в шаблонах)

2. **Legacy Button.vue:** оставляем серый стиль или переводим в зелёную палитру?
   - Если переводим: какие компоненты его используют? (TaskForm toggle minimized)
   - **Рекомендация:** перевести в standalone кнопку (зелёная палитра) для консистентности

3. **Подключение Roboto Mono:**
   - Вариант A: `<link>` в `index.html` (Google Fonts CDN)
   - Вариант B: `@import` в `src/styles/index.scss`
   - **Рекомендация:** Вариант A (стандартный подход, кэшируется браузером)
