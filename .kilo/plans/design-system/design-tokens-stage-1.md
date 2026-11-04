# Этап 1: Токенизация текущего состояния стилей

## Цель

Создать систему стилей проекта (`src/styles/theme.scss`) и перевести все литералы согласованных
категорий на токены. **Визуальный результат должен остаться идентичным (zero visual diff).**
Это подготовка к Этапу 2 (миграция на визуальный язык мокапа) и Этапу 3 (темы).

## Зафиксированные решения

| # | Решение |
|---|---------|
| 1 | Файл токенов: `src/styles/theme.scss` |
| 2 | Гибрид: SCSS-секция (compile-time константы) + эмиссия всех токенов в `:root` как CSS custom properties. Компоненты потребляют только `var(--...)`, без импортов. Подключение — один раз: `@use './theme';` в начале `src/styles/index.scss` |
| 3 | Три слоя: primitive → semantic → component (слой 3 только для Button) |
| 4 | `#eee` и `#e5e5e5` — два отдельных примитива (не унифицировать) |
| 5 | Семантическое разделение ролей сейчас, даже если значения совпадают |
| 6 | Кнопка: component-токены `--button-*` (скевоморфизм изолирован, темизуем) |
| 7 | Нормализация записи без изменения значения: `rgba(black, 0.2)` → `rgba(0, 0, 0, 0.2)`; `rgb(221, 221, 221)` → `#ddd`. `#00000081` сохранить как есть (8-значный hex валиден, точное значение) |
| 8 | Темы: заложена архитектурно (два слоя + CSS-переменные). Блоки `[data-theme]` и переключение НЕ реализуются |
| 9 | Категории этапа 1: цвета, типографика, spacing, radius, shadow, sizing, motion — одним проходом. z-index и breakpoints НЕ создаются (0 потребителей в коде) |
| 10 | Правило слоёв: primitive = значение, используемое в ≥2 ролях или входящее в шкалу; одноразовое ролевое значение (особенно shorthand) живёт сразу в semantic-токене литералом |

## Структура theme.scss

```scss
// 1. SCSS-секция: константы сборки. Сейчас пуста (брейкпоинтов и z-index нет)
// 2. :root { primitive-токены; semantic-токены; component-токены (--button-*) }
```

Компоненты не импортируют theme.scss: CSS custom properties глобальны в рантайме.

## Инвентарь токенов

### Цвета: primitive (нейтральная шкала, по светлоте)

| Токен | Значение |
|---|---|
| `--color-neutral-0` | `#fff` |
| `--color-neutral-50` | `#f9f9f9` |
| `--color-neutral-100` | `#f5f5f5` |
| `--color-neutral-200` | `#eee` |
| `--color-neutral-250` | `#e9e9e9` |
| `--color-neutral-300` | `#e5e5e5` |
| `--color-neutral-350` | `#e1e1e1` |
| `--color-neutral-400` | `#ddd` |
| `--color-neutral-450` | `#d5d5d5` |
| `--color-neutral-500` | `#ccc` |
| `--color-neutral-600` | `#aaa` |
| `--color-neutral-700` | `#999` |
| `--color-neutral-800` | `#555` |
| `--color-neutral-900` | `#0f1111` |

### Цвета: semantic

| Токен | Значение | Потребители (файл:строка) |
|---|---|---|
| `--color-bg-app` | neutral-200 | Layout.vue:19 |
| `--color-bg-surface` | neutral-0 | Layout.vue:28,32 |
| `--color-bg-sidebar` | neutral-300 | TaskForm.vue:51 |
| `--color-bg-header` | neutral-200 | CalendarHeader.vue:52 |
| `--color-bg-controls` | neutral-200 | CalendarPeriodControls.vue:19; CalendarDateControls.vue:24 |
| `--color-bg-input` | neutral-200 | TextArea.vue:27 |
| `--color-bg-card` | neutral-0 | TaskItem.vue:73 |
| `--color-bg-card-hover` | `rgba(255, 255, 255, 0.93)` | TaskItem.vue:157 |
| `--color-bg-day-today` | neutral-300 | CalendarDay.vue:40 |
| `--color-bg-month-cell` | neutral-250 | CalendarYear.vue:46 |
| `--color-bg-action-area` | neutral-350 | ActionArea.vue:62 |
| `--color-bg-action-area-active` | neutral-450 | ActionArea.vue:77 |
| `--color-bg-checkmark` | neutral-0 | TaskItem.vue:100 |
| `--color-bg-checkmark-hover` | neutral-50 | TaskItem.vue:112 |
| `--color-bg-checkmark-checked` | neutral-200 | TaskItem.vue:119 |
| `--color-bg-danger` | `rgba(255, 0, 0, 0.2)` | ActionArea.vue:73; TaskItem.vue:180 |
| `--color-bg-danger-active` | `rgba(255, 0, 0, 0.4)` | ActionArea.vue:81 |
| `--color-text-primary` | neutral-900 | Button.vue:35,54 |
| `--color-text-secondary` | neutral-700 | TaskList.vue:76; TaskItem.vue:74; TaskForm.vue:61; CalendarHeader.vue:55 |
| `--color-text-input` | neutral-800 | TextArea.vue:30 |
| `--color-text-day` | `#00000081` | CalendarDay.vue:36 |
| `--color-text-month-header` | neutral-600 | CalendarYear.vue:39 |
| `--color-text-action-area` | neutral-100 | ActionArea.vue:63 |
| `--color-icon-default` | neutral-100 | BaseIcon.vue:48 |
| `--color-icon-muted` | neutral-450 | TaskList.vue:80; ActionArea.vue:69 |
| `--color-border-default` | neutral-400 | CalendarWeek.vue:25,29; CalendarMonth.vue:46,51; CalendarYear.vue:47; TaskForm.vue:56 |
| `--color-border-checkmark` | neutral-500 | TaskItem.vue:101,120,143 |
| `--color-accent-drag` | `#b3d4ff` | TaskList.vue:99,104 (через shadow-токены) |
| `--color-shadow-base` | `rgba(0, 0, 0, 0.2)` | все тени карточек/инпута (нормализовано из `rgba(black, 0.2)`) |

### Цвета: component (Button, слой 3)

| Токен | Значение | Потребители |
|---|---|---|
| `--button-bg` | `linear-gradient(#f7f8fa, #e7e9ec)` | Button.vue:28 |
| `--button-border-color` | `#adb1b8 #a2a6ac #8d9096` | Button.vue:29 |
| `--button-border-color-hover` | `#a2a6ac #979aa1 #82858a` | Button.vue:67 |
| `--button-border-color-active` | `#a2a6ac` | Button.vue:59,63 (border-bottom-color) |
| `--button-color-focus-border` | `#e77600` | Button.vue:71 |
| `--button-shadow` | `rgba(255, 255, 255, 0.6) 0 1px 0 inset` | Button.vue:33; TaskForm.vue:69-71 (в композиции) |
| `--button-shadow-focus` | `rgba(228, 121, 17, 0.5) 0 0 3px 2px` | Button.vue:72 |

### Типографика

Primitive: `--font-size-14: 14px`, `--font-size-20: 20px` (используются в ≥2 ролях).

| Semantic-токен | Значение | Потребители |
|---|---|---|
| `--font-family-base` | `Roboto, sans-serif` | index.scss:21 |
| `--font-size-heading` | var(--font-size-20) | index.scss:15; CalendarYear.vue:41 |
| `--font-size-day` | var(--font-size-20) | CalendarMonth.vue:53 |
| `--font-size-day-minimized` | var(--font-size-14) | CalendarMonth.vue:67 |
| `--font-size-input` | var(--font-size-14) | TextArea.vue:31 |
| `--font-size-button` | `13px` | Button.vue:39 |
| `--font-size-action-area` | `32px` | ActionArea.vue:64 |
| `--font-weight-heading` | `100` | index.scss:11 |
| `--letter-spacing-heading` | `1px` | index.scss:16 |
| `--letter-spacing-base` | `0.01em` | index.scss:22 |
| `--line-height-button` | `16px` | Button.vue:51 |
| `--line-height-form-toggle` | `35px` | TaskForm.vue:66 |

### Spacing

Primitive: `--space-5: 5px`, `--space-10: 10px`, `--space-20: 20px`, `--space-30: 30px`.

| Semantic-токен | Значение | Потребители |
|---|---|---|
| `--space-list` | var(--space-10) | TaskList.vue:71 |
| `--space-list-item-gap` | var(--space-10) | TaskList.vue:89 |
| `--space-card` | var(--space-20) | TaskItem.vue:71 |
| `--space-card-mini` | `3px 15px 5px` | TaskItem.vue:193 |
| `--space-day` | var(--space-5) | CalendarDay.vue:37 |
| `--space-controls` | var(--space-10) | CalendarPeriodControls.vue:20; CalendarDateControls.vue:25 |
| `--space-controls-gap` | var(--space-5) | CalendarDateControls.vue:28 |
| `--space-header-title` | var(--space-20) | CalendarHeader.vue:56 |
| `--space-input` | var(--space-10) | TextArea.vue:36 |
| `--space-form-input` | var(--space-10) | TaskForm.vue:98 |
| `--space-form-toggle` | `0 0 0 var(--space-10)` | TaskForm.vue:65 |
| `--space-form-toggle-minimized` | `8px` | TaskForm.vue:90 |
| `--space-form-icon-offset` | var(--space-10) | TaskForm.vue:77 |
| `--space-form-header` | `12.5px 8px` | TaskForm.vue:60 |
| `--space-checkmark-text` | var(--space-30) | TaskItem.vue:106 |
| `--space-action-area` | `4px 20px` | ActionArea.vue:66 |
| `--space-button` | `0 7px` | Button.vue:42 |
| `--space-year-grid-gap` | `10px 60px` | CalendarYear.vue:27 |
| `--space-year` | `10px 15px` | CalendarYear.vue:28 |
| `--space-year-header` | `10px 5px` | CalendarYear.vue:40 |
| `--space-month-dow` | `5px 5px` | CalendarMonth.vue:47 |
| `--space-overdue-warning` | var(--space-5) | TaskItem.vue:184 (мёртвое правило, см. исключения) |

### Radius

Primitive: `--radius-4: 4px`, `--radius-10: 10px`, `--radius-30: 30px`.

| Semantic-токен | Значение | Потребители |
|---|---|---|
| `--radius-control` | var(--radius-4) | TextArea.vue:29; Button.vue:32 |
| `--radius-card` | var(--radius-10) | TaskItem.vue:76; CalendarYear.vue:48 |
| `--radius-checkmark` | var(--radius-30) | TaskItem.vue:102 |
| `--radius-form-toggle` | var(--radius-30) | TaskForm.vue:68 |
| `--radius-button-group-first` | `4px 0 0 4px` | CalendarPeriodControls.vue:28 |
| `--radius-button-group-last` | `0 4px 4px 0` | CalendarPeriodControls.vue:33 |

### Shadow

| Токен | Значение | Потребители |
|---|---|---|
| `--shadow-card` | `0 2px 1px -1px var(--color-shadow-base)` | TaskItem.vue:75; TaskForm.vue:52 |
| `--shadow-card-hover` | `0 2px 1px 0 var(--color-shadow-base)` | TaskItem.vue:158 |
| `--shadow-card-completed` | `inset 1px 1px 0 0 var(--color-border-default), inset -1px -1px 0 0 var(--color-border-default)` | TaskItem.vue:167-169 |
| `--shadow-checkmark` | `inset 0 0 0 1px var(--color-border-checkmark)` | TaskItem.vue:101,120 |
| `--shadow-input-inset` | `inset 1px 1px 1px 0 var(--color-shadow-base), inset -1px -1px 1px 0 rgba(255, 255, 255, 0.5)` | TextArea.vue:33-35 |
| `--shadow-drag-top` | `0 -2px 1px 0 var(--color-accent-drag), 0 2px 1px -1px var(--color-shadow-base)` | TaskList.vue:98-100 |
| `--shadow-drag-bottom` | `0 2px 1px 0 var(--color-accent-drag)` | TaskList.vue:104 |

Композиция: TaskForm.vue:69-71 → `box-shadow: var(--button-shadow), var(--shadow-card);`

### Sizing

| Токен | Значение | Потребители |
|---|---|---|
| `--size-button-height` | `29px` | Button.vue:38 |
| `--size-checkmark` | `20px` | TaskItem.vue:97-98 |
| `--size-check-mark-width` | `5px` | TaskItem.vue:141 |
| `--size-check-mark-height` | `10px` | TaskItem.vue:142 |
| `--size-overdue-stripe` | `10px` | TaskItem.vue:149 |
| `--size-icon-small` | `16px` | BaseIcon.vue:52-53 |
| `--size-icon-medium` | `32px` | BaseIcon.vue:57-58 |
| `--size-sidebar` | `300px` | TaskForm.vue:53 |
| `--size-sidebar-minimized` | `30px` | TaskForm.vue:83 |
| `--size-sidebar-max` | `250px` | MainPage.vue:30 |
| `--size-input-height` | `15px` | TaskForm.vue:96 |
| `--size-input-width` | `210px` | TaskForm.vue:97 |
| `--size-period-button` | `61px` | CalendarPeriodControls.vue:24 |
| `--size-delete-area` | `200px` | CalendarHeader.vue:70 |
| `--size-mini-task-height` | `30px` | TaskItem.vue:194 |
| `--size-mini-task-width` | `170px` | TaskItem.vue:195 |
| `--size-form-toggle-icon` | `20px` | TaskForm.vue:75-76 |
| `--size-month-dow-row` | `30px` | CalendarMonth.vue:43 (в `grid-template-rows`) |

### Motion

Primitive: `--duration-fast: 0.1s`, `--duration-base: 0.2s`, `--ease-default: ease`,
`--ease-in: ease-in`, `--ease-in-out: ease-in-out`.

| Semantic-токен | Значение | Потребители |
|---|---|---|
| `--transition-drag-indicator` | `var(--duration-base) all var(--ease-in-out)` | TaskList.vue:94 |
| `--transition-action-area` | `var(--duration-fast) all var(--ease-default)` | ActionArea.vue:78 |
| `--transition-sidebar` | `var(--duration-base) all var(--ease-in)` | TaskForm.vue:84 |
| `--transition-card-completed` | `var(--duration-fast) all var(--ease-in)` | TaskItem.vue:171 |
| `--transition-header-dnd` | `var(--duration-base) all var(--ease-default)` | CalendarHeader.vue:77 |

## Порядок работ

1.  Создать `src/styles/theme.scss` по инвентарю выше (SCSS-секция + `:root`).
2.  В `src/styles/index.scss`: первой строкой `@use './theme';`, затем заменить литералы
    (font-family, font-weight, font-size, letter-spacing) на semantic-токены.
3.  Заменить литералы на `var(--...)` в стилях компонентов (чек-лист ниже). Шаблоны и логику
    НЕ трогать.
4.  `pnpm check`, `pnpm test:unit`.
5.  Аудит grep + визуальный smoke (см. Валидацию).

### Чек-лист файлов (литералы → токены)

- `src/styles/index.scss` — типографика
- `src/components/layout/Layout.vue` — 3 фона
- `src/views/MainPage.vue` — `max-width`
- `src/components/task-form/TaskForm.vue` — фон, тень, ширины, border, цвет, отступы,
  line-height, radius, композиция теней, размер иконки, размеры input, transition
- `src/components/tasks/TaskList.vue` — padding, цвет, fill, gap, transition, drag-тени
- `src/components/task/TaskItem.vue` — фон/цвет/тени/radius/отступы/размеры/transition
- `src/components/button/Button.vue` — всё через `--button-*` + semantic
- `src/components/text-area/TextArea.vue` — фон, radius, цвет, font-size, тень, padding
- `src/components/calendar-header/CalendarHeader.vue` — фон, цвет, padding-left, ширина, transition
- `src/components/calendar-period-controls/CalendarPeriodControls.vue` — фон, padding, ширина, radius
- `src/components/calendar-date-controls/CalendarDateControls.vue` — фон, padding, gap
- `src/components/calendar-day/CalendarDay.vue` — цвет, padding, today-фон
- `src/components/calendar-week/CalendarWeek.vue` — border
- `src/components/calendar-month/CalendarMonth.vue` — border, margin, font-size, grid-row
- `src/components/calendar-year/CalendarYear.vue` — gap, padding, цвет, font-size, фон, border, radius, margin
- `src/components/action-area/ActionArea.vue` — фон, цвет, font-size, padding, fill, transition
- `src/components/icon/BaseIcon.vue` — fill, размеры (только CSS)
- `src/components/calendar/Calendar.vue` — литералов нет, не меняется

## Исключения (литералы остаются, задокументированы)

- `BaseIcon.vue:37-39` — атрибуты шаблона `width="32" height="32" fill="#000"`: presentation
  attributes не принимают `var()`; во всех фактических использованиях перекрыты scoped-CSS.
  Удаление = «заодно»-чистка, вне скоупа.
- Значения `opacity` (0, 0.1, 0.3, 0.5, 0.8, 0.99, 1) — категория не согласована для этапа 1.
- Структурные значения: `border-width`, `border-style`, `grid-template-columns`, позиции,
  `display`/`flex`/`overflow`, `border-radius: 0` и составные `border-width` в
  CalendarPeriodControls.
- Мёртвое правило `TaskItem.vue:183-185` (`.overdue .warning`): токенизируется, но НЕ удаляется
  (чистка мёртвого кода вне скоупа).

## Валидация

1.  `pnpm check` — зелёный.
2.  `pnpm test:unit` — зелёный (14 spec-файлов; стили в них не asserted).
3.  Аудит: `rg "#[0-9a-fA-F]{3,8}|rgba?\(" src/components src/styles` — остаются только
    задокументированные исключения (атрибуты BaseIcon) и значения внутри theme.scss.
4.  Визуальный smoke (`pnpm dev` + `pnpm start-server`): week/month/year; сайдбар обычный и
  minimized; задачи active/completed/overdue/mini; drag задачи (индикаторы border-top/bottom,
  dnd-mode header с ActionArea dangerous); hover/active/focus кнопок (Tab); hover/checked
  чекмарка; колонка today. Сравнение до/после — без различий.

## Риски и примечания

- `var()` в scoped-стилях SFC работает (рантайм-разрешение); специфичность и каскад не меняются.
- Нормализации точны: `rgb(221, 221, 221)` ≡ `#ddd`; `rgba(black, 0.2)` ≡ `rgba(0, 0, 0, 0.2)`.
- Custom properties корректно хранят значения с запятыми/списками (font-family, shadow-слои,
  border-color-списки, градиент).
- Композиция теней через запятую из нескольких `var()` валидна.
- Директории `packages/` в репозитории нет (устаревшие вкладки редактора); рабочий tree — `src/`.
- `legacy-react/` не трогать (read-only reference).

## Вне скоупа

- Этап 2: миграция на визуальный язык мокапа (новые значения primitive-слоя, структурные правки).
- Этап 3: темы (`[data-theme]`, подход к вычислению, переключение).
- Токенизация opacity, чистка мёртвого кода, правки шаблонов/логики.
