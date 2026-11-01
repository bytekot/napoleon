# Этап 0: Инфраструктура Vue-app

**Статус: РЕАЛИЗОВАН**
**Сложность:** Низкая
**Блокирует:** все остальные этапы

---

## Что сделано

### 0.1 PrimeVue

Установлены `primevue@5.0.4`, `@primevue/themes@4.5.4`, `primeicons@8.0.2`.

`src/main.ts` настроен с темой Aura и `darkModeSelector: false`.

### 0.2 Типы (`src/types/`)

| Файл | Содержимое |
|------|-----------|
| `tasks.ts` | `Task`, `TaskItemProps` |
| `calendar.ts` | `CalendarPeriod` (literal union), `MovingItem` |
| `shared.ts` | `Size`, `IconProps` |

React-специфичные типы **не переносились**: `CalendarContextValue`, `CalendarReducerAction`, `MutableRefObject`. Они привязаны к Context API и `useReducer`, во Vue заменяются composable (Этап 4).

### 0.3 Константы (`src/constants/`)

`calendar.ts` — `CALENDAR_PERIODS`, `DAYS_OF_WEEK` (с `as const`)
`shared.ts` — `SIZES`

### 0.4 Утилиты (`src/utils/`)

`calendar.ts` — 10 функций перенесены из legacy
`tasks.ts` — `getNodeIndex`, `getDraggedTaskOrder`

### 0.5 Boilerplate

Удалены `HelloWorld.vue`, `WelcomeItem.vue`, `TheWelcome.vue`, `components/icons/`, `stores/counter.ts`, `AboutView.vue`, `HomeView.vue`, `__tests__/HelloWorld.spec.ts`.

Роутер настроен на lazy-загрузку `MainPage.vue`. Создана заглушка `MainPage.vue`.

---

## Проверено

| Критерий | Статус |
|----------|--------|
| PrimeVue установлен и настроен с Aura | ✓ |
| `main.ts` подключает тему и primeicons | ✓ |
| Типы созданы, без React-специфики | ✓ |
| Константы созданы с `as const` | ✓ |
| Утилиты перенесены | ✓ |
| Boilerplate удалён | ✓ |
| Роутер → MainPage | ✓ |
| `stores/` пуст, готов к Этапу 1 | ✓ |

---

## Требуется правка

При аудите legacy-кода в уже перенесённых файлах обнаружены два дефекта. **Этап 0 остаётся закрытым** — правки включены в объём Этапа 1, чтобы не переоткрывать завершённый этап.

| Баг | Файл | Куда идёт фикс |
|-----|------|----------------|
| **B1** | `src/utils/calendar.ts` — `getThisMonday` | [Этап 1](./stage-1-task-store.md) |
| **B7** | `src/utils/tasks.ts` — `getNodeIndex` | [Этап 1](./stage-1-task-store.md) |

Полное описание и код фиксов — в файле Этапа 1. Реестр всех багов — в [индексе](./1793484623270-react-to-vue-migration.md).

---

## Следующий этап

→ [Этап 1: Task Store + API](./stage-1-task-store.md)
