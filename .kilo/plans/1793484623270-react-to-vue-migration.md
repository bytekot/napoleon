# План миграции Napoleon: React → Vue

## Контекст

**Цель:** Мигрировать task board с календарём с React на Vue 3.  
**Legacy:** `packages/react-app/` (read-only reference)  
**Target:** `packages/vue-app/` (свежий проект, требует настройки)  
**Бэкенд:** `api/` (не меняется, REST API на :3001)

### Текущее состояние Vue-app
- Vue 3.5 + Pinia 4 + Vue Router 5 + TypeScript ✓
- PrimeVue **не установлен**
- Есть базовая структура (stores/, views/, components/, router/)
- Заглушки HomeView/AboutView

### Архитектура React-app (для понимания)
- **Store:** Redux Toolkit, entity-based (task slice с entities/ids)
- **Компоненты:** 17 директорий, container/component паттерн
- **Ключевые фичи:** Calendar (week/month/year), Tasks CRUD, Drag-and-Drop
- **API вызовы:** fetch через createAsyncThunk

---

## Принятые решения

1. **CSS подход:** Scoped CSS + `lang="scss"` (инкапсуляция стилей компонента)
2. **PrimeVue тема:** Aura (современная дефолтная, легко меняется)
3. **Валидация:** Поэтапная, начиная с Этапа 0
4. **TS улучшения:** Обсуждаются перед применением, не применяются автоматически

---

## Этапы миграции

### Этап 0: Настройка инфраструктуры Vue-app
**Сложность:** Низкая  
**Блокирует:** Все остальные этапы

#### Задача 0.1: Установка и настройка PrimeVue

**Команды:**
```bash
cd packages/vue-app
pnpm add primevue @primevue/themes primeicons
```

**Настройка в `src/main.ts`:**
```ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import 'primeicons/primeicons.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false // отключить авто-переключение по системной теме
    }
  }
})

app.mount('#app')
```

**Проверка:** Создать тестовый компонент с `<Button label="Test" />`, убедиться что рендерится со стилями Aura.

---

#### Задача 0.2: Создание структуры типов (`src/types/`)

**Файл `src/types/tasks.ts`:**
```ts
export interface Task {
  id: string
  name: string
  creationDate: string
  dueDate: string | null
  order: number | null
  completed: boolean
}

// Props типы адаптируются под Vue (без React.ChangeEvent/DragEvent)
export interface TaskItemProps {
  task: Task
  draggable?: boolean
}
```

**Файл `src/types/calendar.ts`:**
```ts
// Чистые доменные типы (без React-специфики)
export type CalendarPeriod = 'week' | 'month' | 'year'

export interface MovingItem {
  id: string
  element: EventTarget | null
}

// Состояние календаря будет определено в composable (Этап 4)
// Не переносим: CalendarContextValue, CalendarReducerAction, MutableRefObject
```

**Файл `src/types/shared.ts`:**
```ts
export type Size = 'small' | 'medium'

export interface IconProps {
  className?: string
  size?: Size
}
```

**TS улучшение (для обсуждения):** 
- В React `TaskProps` содержит `onCheckChange?: (taskId: string, event: React.ChangeEvent<HTMLInputElement>) => void`
- Во Vue события передаются через emit, поэтому props упрощаются до `TaskItemProps` выше
- Обработчики событий определяются в родителе через `@check-change="handler"`

---

#### Задача 0.3: Создание констант (`src/constants/`)

**Файл `src/constants/calendar.ts`:**
```ts
export const CALENDAR_PERIODS = {
  week: 'week',
  month: 'month',
  year: 'year',
} as const

export const DAYS_OF_WEEK = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'] as const
```

**Файл `src/constants/shared.ts`:**
```ts
export const SIZES = {
  small: 'small',
  medium: 'medium',
} as const
```

**Примечание:** Константы переносятся без изменений, они framework-agnostic.

---

#### Задача 0.4: Настройка утилит (`src/utils/`)

**Файл `src/utils/calendar.ts`:**
Перенести все функции из `packages/react-app/src/utils/calendar.ts` без изменений:
- `getWeekDayDates(date: Date): Date[]`
- `getMonthWeekDates(date: Date): Date[]`
- `getYearMonthDates(date: Date): Date[]`
- `getCalendarMonthDates(date: Date): Date[]`
- `getThisMonday(now: Date): Date`
- `getMonthName(date: Date): string`
- `getMonth(date: Date): string`
- `isCurrentMonth(date: Date): boolean`
- `isToday(date: Date): boolean`
- `getDateWithOffset(date: Date, period: CalendarPeriod, offset: number): Date`

**Файл `src/utils/tasks.ts`:**
Перенести `getDraggedTaskOrder` из React версии. Функция работает с DOM API (не React-specific), поэтому переносится как есть:
```ts
export function getDraggedTaskOrder(element: Element, clientY: number): number
```

**TS улучшение (для обсуждения):**
- Добавить JSDoc комментарии к функциям для лучшей документации
- Рассмотреть возможность добавления runtime validation (например, через zod) для дат

---

#### Задача 0.5: Очистка boilerplate

**Удалить файлы:**
- `src/components/HelloWorld.vue`
- `src/components/WelcomeItem.vue`
- `src/components/TheWelcome.vue`
- `src/components/icons/` (вся директория)
- `src/stores/counter.ts`
- `src/views/AboutView.vue`
- `src/views/HomeView.vue` (заменить на MainPage позже)
- `src/components/__tests__/HelloWorld.spec.ts`

**Обновить `src/router/index.ts`:**
```ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/MainPage.vue'), // заглушка пока
    },
  ],
})

export default router
```

**Создать заглушку `src/views/MainPage.vue`:**
```vue
<script setup lang="ts">
// Будет реализовано на Этапе 7
</script>

<template>
  <div>MainPage placeholder</div>
</template>
```

---

#### Критерии завершения Этапа 0
- [ ] `pnpm dev:vue` запускается без ошибок
- [ ] `pnpm type-check` проходит
- [ ] PrimeVue Button рендерится со стилями Aura
- [ ] Типы из `src/types/` экспортируются и импортируются без ошибок
- [ ] Утилиты из `src/utils/` работают (можно протестировать в консоли)
- [ ] Boilerplate удалён, роутер настроен
- [ ] `pnpm build` succeeds

---

#### Проверка после завершения
```bash
# В корне проекта
pnpm dev:vue        # Должен запуститься localhost:5174
pnpm type-check     # Должен пройти без ошибок
pnpm build          # Должен собрать production bundle
```

---

### Этап 1: Task Store (Pinia)
**Сложность:** Средняя  
**Блокирует:** Этап 3, 4, 5  
**Зависит от:** Этап 0

#### Задачи
1. Создать `src/stores/tasks.ts`
   - State: entities (Map), ids (string[]), status, error
   - Getters: taskById, unplannedTaskIds, taskIdsByDueDate
   - Actions: fetchTasks, createTask, editTask, deleteTask
2. Реализовать API-вызовы
   - Использовать fetch (или axios, если есть в проекте)
   - Обработка pending/success/error состояний
3. Оптимистичные обновления
   - createTask: добавить с temp ID → заменить на server ID
   - editTask: обновить локально → подтвердить сервером
   - deleteTask: удалить сразу → откат при ошибке

#### Ключевые отличия от Redux
- Нет createSlice/createAsyncThunk — используем defineStore
- Getters вместо selectors (кэшируются автоматически)
- Actions могут быть async напрямую (без thunk middleware)
- Мутации state прямые (не нужно Immer)

#### Критерии завершения
- [ ] Store создан и типизирован
- [ ] fetchTasks загружает задачи с API
- [ ] CRUD операции работают
- [ ] Devtools показывают состояние store

---

### Этап 2: Layout и базовые UI-компоненты
**Сложность:** Низкая  
**Блокирует:** Этап 3, 4  
**Зависит от:** Этап 0

#### Задачи
1. Layout компонент (`src/components/layout/Layout.vue`)
   - Обёртка приложения (header, footer, content area)
2. Header/Footer (если нужны функциональные)
   - Или оставить как статические элементы в App.vue
3. Button (`src/components/button/AppButton.vue`)
   - Props: size, disabled, onClick
   - PrimeVue: рассмотреть `<Button>` как базу
4. TextArea (`src/components/text-area/AppTextArea.vue`)
   - Props: value, placeholder, onChange, onKeyDown
   - PrimeVue: `<Textarea>` или `<InputText>`
5. Иконки
   - Перенести SVG-иконки из React assets
   - Создать компоненты или использовать inline SVG

#### PrimeVue vs Custom
| Компонент | Решение | Причина |
|-----------|---------|---------|
| Button | PrimeVue | Стандартный, с states |
| Textarea/Input | PrimeVue | Validation, styling из коробки |
| Checkbox | PrimeVue | Для tasks completion |
| Layout | Custom | Простая обёртка, PrimeVue не нужен |

#### Критерии завершения
- [ ] Layout рендерит slot контент
- [ ] Button/TextArea работают с v-model
- [ ] Стили соответствуют дизайну (SCSS modules или scoped CSS)

---

### Этап 3: TasksForm и Tasks List
**Сложность:** Средняя  
**Блокирует:** Этап 6  
**Зависит от:** Этап 1, 2

#### Задачи
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
   - useTasksStore() в компонентах
   - Создание задачи через store.createTask()

#### Ключевые концепции Vue
- `v-model` для input binding
- `@keyup.enter` для обработки Enter
- `:class` для динамических классов (вместо classNames)
- Computed для фильтрации/сортировки (вместо useMemo)

#### Критерии завершения
- [ ] Можно создать задачу (появляется в списке)
- [ ] Можно отметить задачу выполненной
- [ ] Unplanned задачи отображаются
- [ ] Визуальное сходство с React версией

---

### Этап 4: Calendar Core
**Сложность:** Высокая  
**Блокирует:** Этап 5, 6  
**Зависит от:** Этап 0, 2

#### Задачи
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

#### Решение: Store vs Composable
**Рекомендация:** Использовать **composable** (`useCalendar`), так как:
- Calendar state локален для компонента calendar
- Не нужен доступ из произвольных компонентов вне calendar tree
- Легче тестировать и переиспользовать

Если позже понадобится глобальный доступ (например, drag-drop между разными view), можно поднять в store.

#### PrimeVue Calendar?
**НЕ использовать PrimeVue Calendar**, потому что:
- Нам нужен custom grid layout (week/month/year views)
- DnD интеграция требует контроля над каждым днём
- PrimeVue Calendar — это date picker, а не task board calendar

#### Критерии завершения
- [ ] Calendar рендерится с текущей датой
- [ ] Переключение period работает
- [ ] Навигация prev/next/today работает
- [ ] Header показывает корректный период

---

### Этап 5: Calendar Views (Week/Month/Year)
**Сложность:** Высокая  
**Блокирует:** Этап 6  
**Зависит от:** Этап 4

#### Задачи
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

#### Структура данных
- Использовать утилиты из Этапа 0 (getWeekDayDates, getMonthWeekDates, etc.)
- Каждая view получает date из calendar composable/store
- Задачи фильтруются по dueDate через store getter

#### Критерии завершения
- [ ] Week view показывает 7 дней с задачами
- [ ] Month view показывает сетку дней
- [ ] Year view показывает 12 месяцев
- [ ] Переключение между views работает
- [ ] Дни корректно стилизованы (today, other month)

---

### Этап 6: Drag-and-Drop
**Сложность:** Высокая  
**Блокирует:** Финальная интеграция  
**Зависит от:** Этап 3, 5

#### Задачи
1. Draggable Task
   - `draggable="true"` на TaskItem
   - `@dragstart` — сохранить taskId и element
   - Visual feedback при перетаскивании
2. Drop Zones
   - CalendarDay как drop zone
   - `@dragover.prevent` — разрешить drop
   - `@drop` — изменить dueDate задачи
3. Reordering within day
   - Отслеживание позиции через getDraggedTaskOrder
   - Обновление order при drop
4. Optimistic updates
   - Немедленное обновление UI
   - Откат при ошибке API

#### Native DnD vs Library
**Начать с Native HTML5 DnD**, так как:
- React версия использует native DnD
- Меньше зависимостей
- Достаточно для вертикального reordering

**Рассмотреть библиотеку** (SortableJS/vuedraggable), если:
- Потребуется complex multi-container drag
- Touch support станет приоритетом
- Native DnD окажется слишком ограниченным

#### Критерии завершения
- [ ] Задачу можно перетащить из unplanned в день
- [ ] Задачу можно перетащить между днями
- [ ] Порядок задач сохраняется
- [ ] UI обновляется оптимистично
- [ ] API синхронизирует изменения

---

### Этап 7: MainPage и финальная интеграция
**Сложность:** Низкая  
**Зависит от:** Все предыдущие

#### Задачи
1. MainPage (`src/views/MainPage.vue`)
   - Composition: TasksForm + Calendar
   - Load tasks on mount (store.fetchTasks)
2. Роутинг
   - `/` → MainPage
   - Удалить ненужные routes
3. Styling polish
   - Responsive layout
   - SCSS modules или CSS variables
4. Error handling
   - Global error boundary (Vue ErrorBoundary component)
   - Toast notifications для API ошибок (PrimeVue Toast)

#### Критерии завершения
- [ ] Приложение загружается и показывает задачи
- [ ] Все CRUD операции работают
- [ ] Calendar navigation работает
- [ ] Drag-and-drop работает
- [ ] Визуальное соответствие React версии
- [ ] `pnpm type-check` проходит
- [ ] `pnpm build` succeeds

---

## Приоритизация и зависимости

```
Этап 0 (Setup)
    ↓
Этап 1 (Store) ──→ Этап 3 (Tasks) ──┐
    ↓                                  ↓
Этап 2 (UI Base) ──→ Этап 4 (Cal Core) ──→ Этап 5 (Cal Views) ──→ Этап 6 (DnD)
                                                                          ↓
                                                                    Этап 7 (Integration)
```

**Критический путь:** 0 → 1 → 3 → 6 (минимальный functional app)  
**Параллелизуемо:** Этап 2 можно делать параллельно с Этапом 1

---

## Рекомендации по PrimeVue

### Использовать из PrimeVue
- Button, Textarea, InputText
- Checkbox (для task completion)
- Toast (для уведомлений)
- ProgressSpinner (для loading states)

### НЕ использовать из PrimeVue
- Calendar (нам нужен custom grid, не date picker)
- DataTable (слишком тяжёлый для простого списка)
- OrderList (не подходит для DnD между днями)

### Возможно использовать
- Panel (для collapsible sections, если нужно)
- Tooltip (для hover states)

---

## TS Улучшения (для обсуждения)

1. **Strict null checks** — включить в tsconfig, убрать `| null` где возможно
2. **Discriminated unions** для status — вместо string использовать `'idle' | 'pending' | 'success' | 'error'`
3. **Readonly arrays** — для ids в store (mutations только через actions)
4. **Type guards** — для проверки типа action payload
5. **API response types** — типизировать ответы сервера явно

Эти улучшения предлагаются к обсуждению перед применением, так как могут увеличить сложность кода.

---

## Риски и Mitigation

| Риск | Вероятность | Влияние | Mitigation |
|------|-------------|---------|------------|
| PrimeVue не покроет нужные компоненты | Средняя | Среднее | Custom компоненты с самого начала |
| DnD будет сложнее чем в React | Высокая | Высокое | Начать с native, library как backup |
| Потеря parity с React версией | Средняя | Среднее | Визуальное сравнение на каждом этапе |
| TypeScript ошибки накопятся | Низкая | Среднее | type-check на каждом этапе |

---

## Open Questions (требуют решения перед соответствующими этапами)

1. **HTTP клиент:** fetch (как в React) или axios? (решить перед Этапом 1)
2. **Testing:** Vitest + @vue/test-utils настроить на Этапе 0 или позже? (решить перед Этапом 1)
3. **Accessibility:** Нужна ли ARIA поддержка в первой версии? (решить перед Этапом 2)
4. **TS улучшения:** Применять ли discriminated unions для status? (обсудить перед Этапом 1)
