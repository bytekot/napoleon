# Архитектурное ревью Vue-проекта (Napoleon)

**Дата:** 2026-11-02  
**Проект:** napoleon-vue (packages/vue-app)  
**Статус миграции:** In Progress (React → Vue)

---

## 1. Общая оценка

Проект демонстрирует **хороший уровень архитектуры** для приложения на стадии миграции. Видна продуманная структура, соблюдение соглашений и внимание к тестированию. Ниже представлен детальный анализ по категориям.

---

## 2. Сильные стороны ✅

### 2.1 Структура проекта
- **Чёткое разделение ответственности:** `api/`, `stores/`, `composables/`, `utils/`, `types/`, `constants/`, `components/`, `views/`
- **Entity-based структура stores** — оправдано для задач с CRUD + ID lookup
- **Компонентная архитектура:** атомарные компоненты (icon, button), составные (calendar-week, tasks-list)

### 2.2 State Management
- **Pinia** — правильный выбор для Vue 3 (не Vuex)
- **Optimistic updates** в `useTasksStore` с откатом при ошибке
- **Разделение state:** задачи (server data) и календарь (UI state) в разных сторах
- **Нормализация данных:** `entities: Record<string, Task>` + `ids: string[]`

### 2.3 TypeScript
- **Strict mode** включён через `@vue/tsconfig`
- **`noUncheckedIndexedAccess: true`** — дополнительная безопасность для array/object lookups
- **Явные типы** для всех интерфейсов (Task, RequestState, CalendarPeriod)
- **Type-safe API:** типизированные параметры и ответы

### 2.4 Code Quality
- **ESLint + Prettier** настроены корректно с type-checked правилами
- **Правило `padding-line-between-statements`** — улучшает читаемость
- **Composition API + `<script setup>`** — современный подход
- **Документация в коде:** JSDoc комментарии к важным местам (EditTaskParams, BaseIcon fallthrough)

### 2.5 Тестирование
- **Vitest** как нативный выбор для Vite
- **Хорошее покрытие stores:** оптимистичные обновления, ошибки, getters
- **Мокирование API** через `vi.mock()`
- **Component tests** присутствуют для ключевых компонентов

### 2.6 API Layer
- **Централизованный HTTP client** (`api/client.ts`)
- **Кастомный `ApiError`** с кодом статуса
- **Переменная окружения** `VITE_API_URL` для конфигурации endpoint

---

## 3. Области улучшения ⚠️

### 3.1 Критические замечания

#### 3.1.1 Отсутствие обработки ошибок в компонентах
**Файлы:** `MainPage.vue`, `TasksForm.vue`, `CalendarHeader.vue`

```typescript
// Текущий код - ошибки игнорируются через void
void store.fetchTasks()
void store.createTask(...)
void store.editTask(...)
void store.deleteTask(...)
```

**Проблема:** Пользователь не получает обратной связи при ошибках сети/API.

**Рекомендация:** Добавить глобальный error handler или toast-уведомления. Как минимум, отображать `store.request.error` в UI.

---

#### 3.1.2 Потенциальная утечка памяти в TaskItem
**Файл:** `src/components/task/TaskItem.vue:43`

```typescript
target.addEventListener('dragend', () => calendarStore.setMovingItemId(null), { once: true })
```

**Проблема:** Если компонент будет уничтожен до завершения drag-операции, listener останется. Хотя используется `{ once: true }`, это не защищает от сценария, когда drag не завершился корректно.

**Рекомендация:** Вынести cleanup в `onBeforeUnmount`:

```typescript
const onDragEnd = () => calendarStore.setMovingItemId(null)

function onDragStart(event: DragEvent) {
  // ...
  target.addEventListener('dragend', onDragEnd, { once: true })
}

onBeforeUnmount(() => {
  if (calendarStore.movingItemId === props.taskId) {
    calendarStore.setMovingItemId(null)
  }
})
```

*Примечание: текущий код уже содержит `onBeforeUnmount`, но он дублирует логику. Стоит объединить.*

---

### 3.2 Средний приоритет

#### 3.2.1 Date handling может быть проблематичным
**Файлы:** `utils/calendar.ts`, `components/task/TaskItem.vue`

```typescript
// TaskItem.vue:16-18
const now = new Date()
now.setHours(0, 0, 0, 0)
```

**Проблемы:**
1. `now` вычисляется один раз при создании компонента, не реактивно
2. Ручные манипуляции с датами подвержены ошибкам (часовые пояса, DST)
3. Функции вроде `isToday()` создают новую `Date()` при каждом вызове

**Рекомендация:** Рассмотреть библиотеку типа `date-fns` или использовать встроенный `Intl` API для форматирования. Для сравнения дат нормализовать их в UTC.

---

#### 3.2.2 Magic numbers в стилях
**Файлы:** Все `.vue` файлы со стилями

```scss
padding: 12.5px 8px;  // TasksForm.vue
margin: 0px 0px 0px 10px;  // TasksForm.vue
height: 29px;  // Button.vue
```

**Проблема:** Хардкоженные значения затрудняют поддержку и темизацию.

**Рекомендация:** Вынести в CSS-переменные или SCSS variables:

```scss
// variables.scss
$spacing-unit: 4px;
$button-height: 29px;
$input-padding: $spacing-unit * 2.5;
```

---

#### 3.2.3 Inline styles в App.vue
**Файл:** `src/App.vue:9-19`

```vue
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: ... }
</style>
```

**Проблема:** Глобальные стили без `scoped` могут конфликтовать с компонентами. Reset обычно выносят в отдельный файл.

**Рекомендация:** Переместить в `src/assets/styles/reset.css` или `main.ts`.

---

#### 3.2.4 Отсутствие loading/error states в UI
**Файл:** `MainPage.vue`

Нет индикации загрузки при первом рендере. `TasksList` показывает "Загрузка...", но только если `request.status === 'pending'`. При `status === 'idle'` пользователь видит пустой список.

**Рекомендация:** Добавить скелетоны или спиннер на уровне страницы.

---

### 3.3 Низкий приоритет / Рекомендации

#### 3.3.1 Роутинг минималистичен
**Файл:** `router/index.ts`

Только один маршрут `/`. Это ок для текущего этапа, но стоит запланировать:
- Lazy loading для MainPage (уже есть через динамический import)
- 404 страницу
- Query params для состояния календаря (дата, период) — позволит делиться ссылками

---

#### 3.3.2 Constants можно расширить
**Файл:** `constants/shared.ts`

```typescript
export const SIZES = { small: 'small', medium: 'medium' } as const
```

Пока используется только для иконок. Если планируется дизайн-система, стоит добавить:
- Цвета
- Spacing scale
- Typography tokens

---

#### 3.3.3 DnD реализация кастомная
Используется нативный HTML5 Drag & Drop API. Это работает, но имеет ограничения:
- Нет поддержки touch devices
- Ограниченная обратная связь при перетаскивании

**Рекомендация (на будущее):** Рассмотреть `@dnd-kit/core` или `vuedraggable` для более сложных сценариев.

---

#### 3.3.4 PrimeVue не используется
Согласно AGENTS.md, PrimeVue выбран как UI library, но в зависимостях его нет. Возможно, решение пересмотрено или интеграция запланирована позже.

---

## 4. Безопасность 🔒

### 4.1 Положительные моменты
- Нет использования `v-html` (защита от XSS)
- Content-Type явно указан как `application/json`
- Accept header требует JSON

### 4.2 Замечания
- **CORS:** Не настроен на клиенте. Предполагается, что API на том же хосте или CORS настроен на сервере.
- **Аутентификация:** Отсутствует. Вероятно, пока не требуется для task board.

---

## 5. Производительность ⚡

### 5.1 Положительные моменты
- **Lazy loading** маршрута через динамический import
- **Computed properties** для производных данных (не пересчитываются без необходимости)
- **v-for с :key** везде корректно

### 5.2 Потенциальные проблемы

#### 5.2.1 Пересчёт getter'ов
**Файл:** `stores/tasks.ts:29-44`

```typescript
unplannedTaskIds(state): string[] {
  return state.ids.filter(...).sort(...)
}
```

Фильтрация и сортировка выполняется при каждом обращении. Для больших списков стоит рассмотреть мемоизацию или перемещение логики в action с сохранением результата в state.

#### 5.2.2 Множественные подписки на store
Каждый `TaskItem` подписывается на `store.taskById(props.taskId)`. При большом количестве задач это может создать нагрузку. Пока не критично, но стоит мониторить.

---

## 6. Соответствие соглашениям из AGENTS.md

| Требование | Статус | Комментарий |
|------------|--------|-------------|
| Pinia (не Vuex) | ✅ | Используется Pinia 4.x |
| Composition API + `<script setup>` | ✅ | Все компоненты |
| Entity-based stores | ✅ | Tasks store нормализован |
| PascalCase файлы, kebab-case в шаблонах | ✅ | Соблюдено |
| Stores: `use[Name]Store` | ✅ | `useTasksStore`, `useCalendarStore` |
| Composables: `use[Name]` prefix | ✅ | `useTrackTask` |
| TypeScript strict mode | ✅ | Через tsconfig |
| Prettier formatting | ✅ | Настроен |
| `pnpm check` после изменений | N/A | Ревью без изменений |
| Legacy React read-only | ✅ | Не модифицируется |

---

## 7. Итоговая матрица

| Категория | Оценка | Комментарий |
|-----------|--------|-------------|
| Архитектура | 🟢 Хорошая | Чёткая структура, разделение ответственности |
| Типизация | 🟢 Строгая | Strict mode, явные типы |
| State Management | 🟢 Продуманный | Optimistic updates, нормализация |
| Тестирование | 🟡 Базовое | Stores покрыты, компоненты частично |
| Error Handling | 🔴 Слабое | Нет пользовательской обратной связи |
| Стили | 🟡 Можно улучшить | Magic numbers, нет design tokens |
| Производительность | 🟢 Приемлемая | Для текущего масштаба |
| Документация | 🟢 Достаточная | Комментарии в ключевых местах |

---

## 8. Приоритетные рекомендации

1. **[High]** Добавить обработку ошибок с пользовательским фидбеком
2. **[Medium]** Нормализовать работу с датами (библиотека или utility module)
3. **[Medium]** Вынести global styles из App.vue
4. **[Low]** Запланировать URL-state для календаря (query params)
5. **[Low]** Рассмотреть CSS variables для theming

---

## 9. Заключение

Проект находится в **хорошем состоянии** для стадии миграции. Архитектурные решения обоснованы и соответствуют современным практикам Vue 3. Основные области улучшения касаются error handling и UX, а не фундаментальных проблем структуры.

**Риск технических долгов:** Низкий. Код поддерживаемый, тесты присутствуют, соглашения соблюдаются.
