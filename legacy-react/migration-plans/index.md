# План миграции Napoleon: React → Vue

Индекс плана. Детали каждого этапа — в отдельном файле.

## Контекст

**Цель:** мигрировать task board с календарём с React на Vue 3.

| Пакет | Роль |
|-------|------|
| `packages/react-app/` | Legacy, read-only reference. **Не модифицировать.** |
| `packages/vue-app/` | Активная разработка |
| `api/` | Express REST API на :3001. **Не меняется.** |

**Архитектура legacy:** Redux Toolkit (entity-based task slice: `entities` + `ids`), 17 компонентов в паттерне container/component, календарь на Context + useReducer, DnD на native HTML5, 4 вызова fetch через createAsyncThunk.

**Замечание о frozen API:** `api/src/utils.js` возвращает из `updateTask` **либо один объект, либо массив** — в зависимости от того, сработала ли логика reordering. Это поведение нельзя менять, store обязан его обрабатывать.

---

## Принятые решения

| # | Решение | Обоснование |
|---|---------|-------------|
| 1 | **Scoped CSS + `lang="scss"`** | Инкапсуляция: компонент владеет внутренними стилями, родитель — позиционированием. Нативный механизм Vue. |
| 2 | **Без UI-библиотеки** | Компоненты переносятся из React как есть. Решение по UI-kit (Reka UI / shadcn-vue) принимается после завершения переноса. |
| 3 | **fetch + тонкий слой `src/api/`** | axios избыточен для 4 эндпоинтов. Обёртка решает реальные проблемы legacy (хардкод URL, отсутствие `response.ok`, дубли заголовков). |
| 4 | **TDD для `utils/` и `stores/`, test-after для компонентов, без unit-тестов для DnD** | Инфраструктура Vitest уже готова. jsdom плохо поддерживает `getBoundingClientRect` и drag-события. |
| 5 | **Discriminated union для статуса запроса** | Делает невалидные состояния (`success` + `error`) непредставимыми. |
| 6 | **Валидация поэтапная** | Этап закрывается → валидация → следующий. |
| 7 | **Баги legacy исправляются при переносе** | Реестр ниже. Legacy-код не правится, фикс применяется во Vue-реализации. |

---

## Индекс этапов

| Этап | Файл | Сложность | Статус |
|------|------|-----------|--------|
| 0. Инфраструктура | [stage-0-infrastructure.md](./stage-0-infrastructure.md) | Низкая | **Реализован** (требуется правка B1, B7 — выполняется в Этапе 1) |
| 1. Task Store + API | [stage-1-task-store.md](./stage-1-task-store.md) | Средняя | К реализации |
| 2. Layout и UI-база | [stage-2-layout-ui-base.md](./stage-2-layout-ui-base.md) | Низкая | К реализации |
| 3. TasksForm и список задач | [stage-3-tasks-form-list.md](./stage-3-tasks-form-list.md) | Средняя | К реализации |
| 4. Calendar Core | [stage-4-calendar-core.md](./stage-4-calendar-core.md) | Высокая | К реализации |
| 5. Calendar Views | [stage-5-calendar-views.md](./stage-5-calendar-views.md) | Высокая | К реализации |
| 6. Drag-and-Drop | [stage-6-drag-and-drop.md](./stage-6-drag-and-drop.md) | Высокая | К реализации |
| 7. MainPage и интеграция | [stage-7-main-page-integration.md](./stage-7-main-page-integration.md) | Низкая | К реализации |

### Зависимости

```
Этап 0 (готов)
   ├──→ Этап 1 (Store + API) ──┬──→ Этап 3 (Tasks) ──┐
   └──→ Этап 2 (UI-база) ──────┤                     │
                               └──→ Этап 4 (Cal Core) └──→ Этап 5 (Cal Views) ──→ Этап 6 (DnD) ──→ Этап 7
```

**Критический путь:** 1 → 3 → 5 → 6 → 7
**Параллелизуемо:** Этап 2 независим от Этапа 1, можно вести одновременно.

---

## Реестр багов legacy

Найдены при аудите React-кода. **Legacy не правится** — фикс применяется в соответствующей Vue-реализации.

| # | Файл в React | Суть | Фикс на этапе | Потребитель |
|---|--------------|------|---------------|-------------|
| B1 | `utils/calendar.ts` | `getThisMonday`: для воскресенья (`getDay() === 0`) возвращает понедельник **следующей** недели | **1** (файл уже перенесён на Этапе 0) | Этапы 4, 5 |
| B2 | `store/entities/task/thunks/get-tasks.ts` | `rejectWithValue` вызван без `return` — ветка мертва. Пустой список трактуется как ошибка | **1** | — |
| B3 | `store/entities/task/index.ts` | `editTask.fulfilled` делает ранний `return` при `meta.arg.completed` — ответ сервера отбрасывается | **1** | — |
| B4 | `pages/main/component.tsx` | `useEffect` без массива зависимостей — dispatch на каждом рендере | **7** | — |
| B5 | `components/tasks/container.tsx` | При drop в unplanned передаётся `dueDate: undefined`; `JSON.stringify` его отбрасывает → дата не очищается | сигнатура: **1**, prop: **3**, хендлер: **6** | Этап 6 |
| B6 | `hooks/tasks.ts` | `useTask` типизирует возможный `undefined` как `Task` — ложь типов, при промахе crash на деструктуризации | getter: **1**, компонент: бэклог | Бэклог |
| B7 | `utils/tasks.ts` | `getNodeIndex` обходит `childNodes` (включая текстовые узлы) и использует `return` внутри `forEach` (не прерывает обход) | **1** (файл уже перенесён на Этапе 0) | Этап 6 |
| B8 | `store/entities/task/index.ts` | `if (params.order)` — при `order === 0` условие ложно, optimistic-смещение пропускается | **1** | — |
| B9 | `components/calendar-week/component.tsx`, `calendar-month/component.tsx`, `utils/calendar.ts` | `dueDate` формируется без zero-padding (`"2026-11-1"`); `getMonth()` возвращает `"2026-1"` для января | **5** | Этап 5 |
| B10 | все 4 thunk-файла | URL API захардкожен, повторяется 4 раза | **1** | — |
| B11 | все 4 thunk-файла | Нет проверки `response.ok` — fetch не бросает исключение на 404/500, код молча парсит тело ошибки | **1** | — |
| B12 | 3 thunk-файла | Заголовки `Accept`/`Content-Type` дублируются в каждом вызове | **1** | — |

### Приоритет по критичности

- **Ломают DnD (ядро приложения):** B5, B7
- **Ломают синхронизацию с сервером:** B2, B3
- **Видны сразу при запуске:** B1 (воскресенье показывает не ту неделю)
- **Потенциальный crash:** B6
- **Косметика / надёжность:** B4, B8, B9, B10, B11, B12

---

## UI-стратегия

Компоненты переносятся из React как есть, без использования UI-библиотек. Все компоненты — кастомные, стили переносятся из legacy SCSS Modules в `<style scoped lang="scss">`.

После завершения переноса возможно подключение легковесной библиотеки (Reka UI / shadcn-vue) для базовых примитивов (Dialog, Dropdown, Toast), если возникнет потребность. Решение принимается на основе реального опыта, не заранее.

---

## Соглашения по коду

Из `AGENTS.md`:

- TypeScript strict mode
- Компоненты: PascalCase файлы, kebab-case в шаблонах
- Stores: `use[Name]Store`
- Composables: `use[Name]` prefix
- Composition API + `<script setup>`

Дополнительно, принято в ходе планирования:

- Стили: `<style scoped lang="scss">` в SFC. Позиционирование задаёт родитель через `style`/class на корневом элементе компонента
- События: `defineEmits`, не callback-props
- HTTP: только через `src/api/`, прямого `fetch` в компонентах и store не должно быть
- Базовый URL: `import.meta.env.VITE_API_URL`, fallback `http://localhost:3001`

---

## Риски

| Риск | Вероятность | Влияние | Меры |
|------|-------------|---------|------|
| DnD окажется сложнее, чем в React | Высокая | Высокое | Начать с native HTML5; SortableJS/vuedraggable как запасной вариант. B5/B7 чинятся заранее, до Этапа 6 |
| Отсутствие UI-библиотеки замедлит разработку базовых компонентов | Низкая | Низкое | Компоненты переносятся из React как есть; при необходимости можно подключить Reka UI / shadcn-vue позже |
| Расхождение с React-версией | Средняя | Среднее | Оба фронтенда запускаются параллельно (`dev:react` :5173, `dev:vue` :5174) для визуального сравнения |
| Накопление TypeScript-ошибок | Низкая | Среднее | `pnpm type-check` в критериях завершения каждого этапа |
| Исправление багов меняет поведение относительно legacy | Средняя | Низкое | Осознанно: фиксы задокументированы в реестре, parity приносится в жертву корректности |

---

## Команды

```bash
pnpm dev:react     # :5173 — legacy, для визуального сравнения
pnpm dev:vue       # :5174 — разработка
pnpm start-server  # :3001 — API
```

Внутри `packages/vue-app`:
```bash
pnpm dev           # vite
pnpm type-check    # vue-tsc --build
pnpm test:unit     # vitest
pnpm build         # type-check + vite build
```
