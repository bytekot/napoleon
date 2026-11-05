# План: Перезапуск бэкенда Napoleon на Hono + Drizzle + SQLite

## Цель
Заменить текущий in-memory Express API (`api/`) на персистентный бэкенд с сохранением контракта с фронтендом и готовностью к расширению (auth, multi-user).

## Стек
- **Runtime:** Node.js 24 LTS (ESM)
- **HTTP:** Hono
- **ORM:** Drizzle ORM
- **БД:** SQLite (через `better-sqlite3`)
- **Валидация:** Zod
- **Язык:** TypeScript (strict mode)

## Структура `api/`
```
api/
├── src/
│   ├── db/
│   │   ├── connection.ts      # better-sqlite3 + drizzle instance
│   │   └── schema.ts          # Drizzle table definitions
│   ├── routes/
│   │   └── tasks.ts           # GET/POST/PATCH/DELETE handlers
│   ├── schemas/
│   │   └── task.schema.ts     # Zod schemas for validation
│   ├── middleware/
│   │   └── error-handler.ts   # Global error handling
│   └── index.ts               # Hono app assembly + export
├── server.ts                  # Точка входа: listen on :3001
├── package.json
├── tsconfig.json
└── drizzle.config.ts          # Drizzle Kit config for migrations
```

## Контракт с фронтендом (сохранить без изменений)

| Метод | Путь | Body | Response |
|-------|------|------|----------|
| GET | `/api/tasks` | — | `Task[]` |
| POST | `/api/task` | `{name, creationDate}` | `Task` |
| PATCH | `/api/task:id` | `{dueDate?, order?, completed?}` | `Task \| Task[]` |
| DELETE | `/api/task:id` | — | `string` (id) |

**Важно:** PATCH при изменении `order` или `dueDate` возвращает массив затронутых задач (логика переупорядочивания из текущего `utils.js:27-83`). Сохраняем как есть, добавляем `// TODO: revisit reorder logic — consider simplifying to single-update with client-side orchestration` в код.

## Схема БД

```ts
// api/src/db/schema.ts
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  creationDate: text('creation_date').notNull(),
  dueDate: text('due_date'),
  order: integer('order'),
  completed: integer('completed', { mode: 'boolean' }).default(false),
})
```

Файл БД: `api/data/napoleon.db` (добавить в `.gitignore`, создать `api/data/.gitkeep`).

## Задачи реализации

### 1. Подготовка
- [ ] Сделать бэкап: `mv api/ api-backup/`
- [ ] Создать новую структуру папок `api/src/{db,routes,schemas,middleware}/`
- [ ] Инициализировать `api/package.json` с зависимостями: `hono`, `@hono/node-server`, `drizzle-orm`, `better-sqlite3`, `zod`, `nanoid`, `tsx` (dev), `typescript` (dev), `drizzle-kit` (dev)
- [ ] Создать `api/tsconfig.json` (ESM, strict, paths)

### 2. База данных
- [ ] `api/src/db/schema.ts` — определение таблицы `tasks`
- [ ] `api/src/db/connection.ts` — создание drizzle instance с `better-sqlite3`
- [ ] `api/drizzle.config.ts` — конфигурация Drizzle Kit
- [ ] Сгенерировать и применить начальную миграцию
- [ ] Добавить `api/data/.gitkeep`, добавить `api/data/*.db` в `.gitignore`

### 3. Валидация
- [ ] `api/src/schemas/task.schema.ts` — Zod схемы: `createTaskSchema`, `editTaskSchema`, `taskIdParamSchema`

### 4. Роуты
- [ ] `api/src/routes/tasks.ts`:
  - `GET /tasks` — select all from tasks
  - `POST /task` — validate body → insert → return created task
  - `PATCH /task:id` — validate params+body → логика переупорядочивания (портировать из `api-backup/src/utils.js:27-83`) → return Task | Task[]
  - `DELETE /task:id` — delete by id → return id
- [ ] Добавить TODO-comment о будущем рефакторинге логики переупорядочивания

### 5. Middleware и сборка
- [ ] `api/src/middleware/error-handler.ts` — global error handler (ZodError → 400, unknown → 500)
- [ ] `api/src/index.ts` — собрать Hono app: CORS middleware + error handler + routes под prefix `/api`
- [ ] `api/server.ts` — точка входа: import app, listen on port 3001

### 6. Скрипты и интеграция
- [ ] Обновить `api/package.json` scripts: `"start": "tsx watch server.ts"`, `"db:generate": "drizzle-kit generate"`, `"db:migrate": "drizzle-kit migrate"`
- [ ] Обновить корневой `package.json`: `"start-server": "pnpm --filter simple_api start"` (или обновить имя пакета)
- [ ] Убедиться что `pnpm start` запускает оба dev-сервера

### 7. Проверка
- [ ] `pnpm start-server` — сервер стартует, создаёт `napoleon.db`
- [ ] Тест через curl/httpie: все 4 эндпоинта работают
- [ ] Фронтенд (`pnpm dev`) подключается к новому API, CRUD работает
- [ ] Остановка и перезапуск сервера — данные сохраняются
- [ ] `pnpm check` в корне проекта проходит (если затрагиваются файлы src/)

## Заметки для будущего (не в scope этой задачи)
- Логика переупорядочивания в PATCH сложна и coupling-зависима. Рассмотреть упрощение: single-update на бэкенде + клиентская оркестрация
- При добавлении auth: таблица `users`, foreign key `tasks.user_id`, JWT middleware
- При добавлении shared tasks: таблица `task_members` или `shared_tasks`
- Рассмотреть seed-скрипт для dev-данных

## Риски
- **Логика переупорядочивания** — самая сложная часть порта. Нужно тщательно протестировать edge cases (смена даты + порядок, границы списка)
- **SQLite concurrency** — `better-sqlite3` синхронный, для dev-сервера это нормально, но при нагрузке может стать bottleneck. WAL-режим включаем в connection
- **Типизация PATCH response** — `Task | Task[]` нетипичен для REST. Hono позволяет, но нужно явно указать return type
