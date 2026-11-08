# Соглашения и принципы тестирования

Документ фиксирует правила написания, организации и запуска тестов в проекте Napoleon.
Соблюдение обязательно для всех новых изменений (см. AGENTS.md: «Отсутствие тестов = незавершённая задача»).

## 1. Общие принципы

| Принцип | Описание |
|---|---|
| **Тесты — спецификация** | Тест описывает *что* делает код, а не *как*. Имя теста = читаемое утверждение на русском языке |
| **Изоляция** | Каждый тест независим от других. Нет общего состояния между `it()`-блоками без явного setup |
| **Детерминизм** | Тесты не зависят от времени, порядка выполнения, внешних сервисов или случайных данных |
| **Быстрота** | Unit-тесты выполняются за миллисекунды. Медленные тесты маркируются отдельно |
| **Читаемость** | Тест читается сверху вниз как сценарий: arrange → act → assert. Без лишних абстракций |
| **Минимальность** | Тестируется одно поведение за один `it()`. Не объединять несколько проверок в один тест |

## 2. Структура тестовых файлов

### Расположение

Тесты размещаются рядом с тестируемым кодом в директории `__tests__/`:

```
src/utils/tasks.ts
src/utils/__tests__/tasks.spec.ts          ← unit-тесты утилиты

api/src/routes/tasks.ts
api/src/routes/__tests__/tasks.spec.ts     ← unit/integration-тесты маршрута

src/stores/task.ts
src/stores/__tests__/task.spec.ts          ← тесты store
```

### Именование

- Файлы: `<name>.spec.ts` (единый суффикс для всего проекта)
- Describe-блоки: имя модуля/функции/компонента
- It-блоки: описание поведения на русском языке, начинается с глагола

```ts
describe('computeReorder', () => {
  it('возвращает пустой массив для несуществующей задачи', () => { ... })
  it('сдвигает соседей при перемещении вниз внутри дня', () => { ... })
})
```

### Группировка

Для больших наборов тестов использовать вложенные `describe` по категориям:

```ts
describe('computeReorder', () => {
  describe('перемещение между днями', () => {
    it('вставляет в начало пустого дня', () => { ... })
    it('уплотняет исходный день после удаления', () => { ... })
  })

  describe('перемещение внутри дня', () => {
    it('no-op при drop на своей позиции', () => { ... })
  })

  describe('валидация входных данных', () => {
    it('отклоняет отрицательную позицию', () => { ... })
  })
})
```

## 3. Frontend (Vue + Pinia)

### Среда

- **Environment:** jsdom
- **Config:** `vitest.config.ts` (корень)
- **Запуск:** `pnpm test:unit` (run), `pnpm test:unit:watch` (watch)
- **Библиотеки:** vitest, @vue/test-utils, Pinia testing utilities

### Что тестировать

| Тип | Приоритет | Примеры |
|---|---|---|
| Утилиты (`src/utils/`) | Высокий | Чистые функции, алгоритмы, трансформации данных |
| Stores (`src/stores/`) | Высокий | State transitions, actions, getters, optimistic updates |
| Composables (`src/composables/`) | Средний | Логика хуков, реактивные вычисления |
| Компоненты (`src/components/`) | Средний | Props/emits, user interactions, conditional rendering |
| Views (`src/views/`) | Низкий | Только если содержат нетривиальную логику |

### Правила для компонентов

- Использовать `@vue/test-utils` mount/shallowMount
- Предпочитать shallowMount для unit-тестов (изоляция от дочерних компонентов)
- Тестировать через props/emits/DOM, а не через внутреннее состояние
- Избегать snapshot-тестов (хрупкие, низкая ценность)

### Правила для stores

- Создавать свежий Pinia instance в каждом тесте или beforeEach
- Тестировать actions как единицу поведения, а не отдельные state-мутации
- Для async-actions: моки API на уровне fetch/axios, не на уровне store internals

## 4. Backend (Hono + Drizzle + SQLite)

### Среда

- **Environment:** node
- **Config:** `api/vitest.config.ts`
- **Запуск:** `pnpm test:api` (run), `pnpm test:api:watch`
- **Setup:** `api/src/test/setup.ts` устанавливает `DATABASE_URL=:memory:`
- **Библиотеки:** vitest, Hono `app.request()`, better-sqlite3

### Что тестировать

| Тип | Приоритет | Подход |
|---|---|---|
| Zod-схемы (`src/schemas/`) | Высокий | Чистые unit-тесты: valid/invalid inputs, edge cases |
| Маршруты (`src/routes/`) | Высокий | Integration via `app.request()` + in-memory DB |
| Middleware | Средний | Unit-тесты с mock Context |
| DB schema / migrations | Низкий | Покрыто интеграционными тестами маршрутов |
| Connection / server entry | Нулевой | Инфраструктурный код, не тестируется напрямую |

### Правила для маршрутов

- Использовать Hono `app.request()` — не запускать реальный HTTP-сервер
- БД: in-memory SQLite через `DATABASE_URL=:memory:` (настраивается в setup)
- Каждый тест получает чистую БД: схема создаётся в beforeEach/globalSetup
- Тестировать полный цикл: request → validation → DB operation → response
- Проверять status code, body shape, side effects в БД

### Правила для схем

- Тестировать оба направления: valid input → success, invalid input → failure с конкретным error message
- Покрывать edge cases: empty strings, null vs undefined, boundary values
- Refine-валидации требуют отдельных тестов на сообщение об ошибке

### Тестовая база данных

Текущий подход: `:memory:` SQLite. Характеристики:

- Полная изоляция: каждый тестовый процесс получает пустую БД
- Нет файлов на диске, нет cleanup
- Требует создания схемы перед каждым тестом (или в globalSetup)
- Не поддерживает WAL-mode и multi-connection сценарии

Если потребуются интеграционные тесты с транзакциями/WAL — перейти на temp-файлы
(`mkdtemp` + уникальный путь на тест). Решение принимается по мере необходимости.

## 5. E2E (Playwright)

### Среда

- **Runner:** Playwright Test (`@playwright/test`)
- **Браузер:** Chromium (единственный проект)
- **Config:** `playwright.config.ts` (корень), `testDir: ./e2e`
- **TS-проект:** `tsconfig.e2e.json` (подключён к root `tsconfig.json`), среда Node
- **Запуск:** `pnpm test:e2e`
- **Расположение тестов:** `e2e/*.spec.ts`

Установка браузера (один раз после клонирования или обновления Playwright):

```bash
pnpm exec playwright install chromium
```

### Изоляция окружения

E2E поднимает полный стек через `webServer` (два процесса) на **выделенных портах**, чтобы не пересекаться с dev-стеком (5173 / 3001):

| Сервис | Команда | Порт | БД |
|---|---|---|---|
| Frontend (Vite) | `pnpm exec vite --port 5273 --strictPort` | 5273 | — |
| Backend (Hono) | reset → `drizzle-kit migrate` → `tsx server.ts` | 3101 | `api/data/napoleon-e2e.db` |

- Backend использует **отдельную файловую БД** `napoleon-e2e.db` — не dev-БД и не `:memory:` backend-тестов. Файл покрыт `.gitignore` (`api/data/*.db`).
- Перед каждым запуском БД очищается и заново мигрируется — детерминированное начальное состояние.
- `DATABASE_URL` и `PORT` передаются через env webServer-а. E2E-backend запускается командой `tsx server.ts` без `--env-file`, поэтому значения берутся только из webServer.env и не конфликтуют с dev-`.env`.
- `api/server.ts` читает `process.env.PORT` (fallback 3001) — dev-поведение не меняется, E2E задаёт 3101.
- `api/drizzle.config.ts` требует `process.env.DATABASE_URL` (бросает ошибку при отсутствии) — миграции применяются к E2E-БД.
- Frontend-webServer получает `VITE_API_URL=http://localhost:3101`, поэтому клиент (`src/api/client.ts`) обращается к E2E-API, а не к dev-`:3001`.
- Оба webServer стартуют с `reuseExistingServer: false`: E2E всегда поднимает свой стек с нужным env и БД. Благодаря выделенным портам E2E можно запускать параллельно с `pnpm start`.

### Последовательное выполнение

Все тесты используют одну БД и один API-сервер, поэтому заданы `fullyParallel: false` и `workers: 1` — это исключает гонку за данные. Параллелизация возможна только после перехода на изоляцию БД на воркер (отдельный сервер/БД на воркер).

### Что тестировать

| Тип | Приоритет | Примеры |
|---|---|---|
| Сквозные пользовательские сценарии | Высокий | создание/редактирование/удаление задачи через UI |
| Интеграция UI ↔ API ↔ БД | Высокий | optimistic updates, round-trip данных |
| Навигация / календарь | Средний | переключение периодов, отображение задач по дням |
| Drag-and-drop | Средний | reorder задач между днями (после интеграции DnD-библиотеки) |

### Соглашения

- Файлы: `<name>.spec.ts` в `e2e/`
- `test.describe` — группа сценариев; `test(...)` — описание поведения на русском, начинается с глагола
- Селекторы: предпочитать семантические (`getByRole`, `getByPlaceholder`, `getByText`) и стабильные data-атрибуты (`[data-task-list]`, `[data-task]`)
- Каждый тест начинается с `page.goto('/')`
- Все тесты одного запуска разделяют общую БД: она очищается и мигрируется один раз перед запуском (не перед каждым тестом). Тесты не должны предполагать пустую БД и зависеть от порядка выполнения

## 6. Организация монорепозитория

### Разделение конфигураций

Frontend и backend имеют **независимые** vitest-конфиги; E2E использует отдельный Playwright-конфиг:

| Пакет | Config | Environment | Exclude из root vitest |
|---|---|---|---|
| Frontend | `vitest.config.ts` (root) | jsdom | — |
| API | `api/vitest.config.ts` | node | `api/**` в root config |
| E2E | `playwright.config.ts` (root) | browser (Chromium) | `e2e/**` в root config |

Root vitest **исключает** `api/**` и `e2e/**` чтобы избежать:
- Двойного запуска тестов
- Некорректной среды (jsdom для Node.js/браузерного кода)
- Конфликтов resolution зависимостей

### Запуск тестов

```bash
# Frontend only
pnpm test:unit              # single run
pnpm test:unit:watch        # watch mode

# API only
pnpm test:api                         # single run
pnpm test:api:watch                   # watch mode

# Оба пакета (параллельно)
pnpm test:unit & pnpm test:api

# E2E (полный стек: Vite + API + Chromium)
pnpm test:e2e
```

### Добавление нового пакета

При добавлении нового workspace-пакета с тестами:
1. Создать `<package>/vitest.config.ts` с подходящей средой
2. Добавить exclude-паттерн в root `vitest.config.ts`
3. Добавить скрипт `test` в package.json пакета
4. Документировать среду и подход в этом файле

## 7. Покрытие и gate

### Обязательные проверки

- `pnpm check` (lint + format + type-check) — **не включает тесты**
- Тесты запускаются отдельно и не блокируют `pnpm check`
- E2E (`pnpm test:e2e`) поднимает полный стек и выполняется отдельно от unit/integration
- В CI тесты должны быть отдельным шагом после `pnpm check`

### Целевое покрытие

Покрытие не измеряется метрикой line/branch coverage. Критерии качества:

- Все публичные функции/методы имеют тесты
- Edge cases и error paths покрыты
- Регрессионные тесты добавляются при исправлении багов
- Новая функциональность без тестов = незавершённая задача (AGENTS.md)

### Когда НЕ писать тесты

- Декларативные конфигурации (Drizzle schema, tsconfig, eslint config)
- Type-only файлы (interfaces, type exports)
- Trivial re-exports и barrel files
- UI-стили и layout (если нет интерактивной логики)

## 8. Mocking и зависимости

### Принципы

- Предпочитать реальное поведение над моками
- Мокать только внешние границы: HTTP-запросы, filesystem, timers
- Не мокать внутренние модули без веской причины
- Если нужно мокать модуль — это сигнал к рефакторингу (нарушение SRP)

### Допустимые моки

| Что | Инструмент | Пример |
|---|---|---|
| HTTP/fetch | msw, nock, или manual mock | API-вызовы в store-тестах |
| Timers | vi.useFakeTimers() | Debounce, throttle, polling |
| Random / Date | vi.setSystemTime(), vi.spyOn(Math, 'random') | Детерминизм |
| Env variables | process.env assignment в setup | DATABASE_URL |

### Недопустимые моки

- Мокирование собственных модулей проекта без архитектурной причины
- Мокирование фреймворка (Vue reactivity, Pinia internals)
- Partial mocks, нарушающие контракт интерфейса

## 9. Процесс

### При добавлении функциональности

1. Написать тесты **до или одновременно** с реализацией
2. Убедиться, что тесты падают без реализации (red-green-refactor)
3. Реализовать минимальный код для прохождения тестов
4. Рефакторить при сохранении зелёных тестов

### При исправлении бага

1. Написать тест, воспроизводящий баг (должен падать)
2. Исправить баг (тест проходит)
3. Проверить, что тест действительно ловил баг (временный revert фикса)

### При рефакторинге

1. Убедиться, что существующие тесты зелёные
2. Рефакторить код
3. Тесты остаются зелёными без изменений (если изменились — это не рефакторинг)
4. Добавить тесты на ранее непокрытые edge cases, обнаруженные при рефакторинге

## 10. Ссылки

- api/src/schemas/__tests__/task.schema.spec.ts — пример schema-тестов
- src/utils/__tests__/computeReorder.spec.ts — пример comprehensive unit-тестов
- src/stores/__tests__/task.spec.ts — пример store integration tests
- e2e/smoke.spec.ts — пример E2E smoke-тестов (Playwright)
