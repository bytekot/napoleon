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
- **Запуск:** `pnpm test:unit` (watch), `pnpm vitest run` (CI)
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
- **Запуск:** `pnpm --filter simple_api test` (run), `pnpm --filter simple_api test:watch`
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

## 5. Организация монорепозитория

### Разделение конфигураций

Frontend и backend имеют **независимые** vitest-конфиги:

| Пакет | Config | Environment | Exclude из root |
|---|---|---|---|
| Frontend | `vitest.config.ts` (root) | jsdom | — |
| API | `api/vitest.config.ts` | node | `api/**` в root config |

Root vitest **исключает** `api/**` чтобы избежать:
- Двойного запуска тестов
- Некорректной среды (jsdom для Node.js кода)
- Конфликтов resolution зависимостей

### Запуск тестов

```bash
# Frontend only
pnpm test:unit              # watch mode
pnpm vitest run             # single run (CI)

# API only
pnpm --filter simple_api test         # single run
pnpm --filter simple_api test:watch   # watch mode

# Оба пакета (параллельно)
pnpm test:unit & pnpm --filter simple_api test
```

### Добавление нового пакета

При добавлении нового workspace-пакета с тестами:
1. Создать `<package>/vitest.config.ts` с подходящей средой
2. Добавить exclude-паттерн в root `vitest.config.ts`
3. Добавить скрипт `test` в package.json пакета
4. Документировать среду и подход в этом файле

## 6. Покрытие и gate

### Обязательные проверки

- `pnpm check` (lint + format + type-check) — **не включает тесты**
- Тесты запускаются отдельно и не блокируют `pnpm check`
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

## 7. Mocking и зависимости

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

## 8. Процесс

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

## 9. Ссылки

- api/src/schemas/__tests__/task.schema.spec.ts — пример schema-тестов
- src/utils/__tests__/computeReorder.spec.ts — пример comprehensive unit-тестов
- src/stores/__tests__/task.spec.ts — пример store integration tests
