# Napoleon

Task board с календарём.

## Tech Stack

- **Frontend:** Vue 3, TypeScript, Pinia, Vue Router
- **Backend:** Hono REST API, Drizzle ORM, SQLite (better-sqlite3), Zod validation
- **Build:** Vite, pnpm
- **Runtime:** Node v24 LTS (через nvm), pnpm 12.x

## Repository Structure

```
napoleon/
├── api/                 # backend (Hono + Drizzle + SQLite)
│   ├── src/
│   │   ├── db/          # Drizzle schema + connection
│   │   ├── routes/      # HTTP handlers
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── middleware/   # Error handler, etc.
│   │   └── index.ts     # Hono app assembly
│   ├── server.ts        # Entry point
│   ├── data/            # SQLite DB file (gitignored)
│   └── drizzle.config.ts
├── src/                 # Vue app
│   ├── api/             # API client
│   ├── components/      # Vue компоненты
│   ├── composables/     # Composition API хуки
│   ├── constants/       # Константы
│   ├── router/          # Vue Router конфигурация
│   ├── stores/          # Pinia stores
│   ├── styles/          # Глобальные стили
│   ├── types/           # TypeScript типы
│   ├── utils/           # Утилиты
│   └── views/           # Страницы
├── public/              # статические ресурсы
└── index.html           # точка входа
```

## Development Commands

```bash
pnpm dev             # Vue app на localhost:5173
pnpm start-server    # API :3001 (tsx watch)
```

### Backend / Database

```bash
pnpm --filter simple_api db:generate   # Generate Drizzle migration
pnpm --filter simple_api db:migrate    # Apply migrations
```

### Проверки и форматирование (frontend)

```bash
pnpm lint            # ESLint (качество кода)
pnpm format          # Prettier: автоформатирование
pnpm format:check    # Prettier: проверка без изменений
pnpm type-check      # vue-tsc
pnpm check           # lint + format:check + type-check параллельно
pnpm vitest run      # frontend-тесты (однократный запуск)
```

### Тесты backend (api/)

```bash
pnpm --filter simple_api test         # однократный запуск
pnpm --filter simple_api test:watch   # watch mode
```

## Architecture Decisions

- **State Management:** Pinia (не Vuex)
- **Store structure:** entity-based для задач (обосновано CRUD + ID lookup; не догма для всех сущностей)
- **Composition API** + `<script setup>`
- **Backend HTTP:** Hono (не Express)
- **ORM:** Drizzle ORM (не raw SQL, не Prisma)
- **Database:** SQLite через better-sqlite3, WAL-mode; файл `api/data/napoleon.db` gitignored
- **Validation:** Zod schemas в `api/src/schemas/`, повторно используются в роутах
- **API contract:**
  - `GET /api/tasks` — список всех задач, возвращает `Task[]`
  - `POST /api/task` — создание задачи, возвращает `Task` (201)
  - `POST /api/tasks/edit` — batch-редактирование, принимает массив обновлений, возвращает `Task[]`
  - `DELETE /api/task/:id` — удаление задачи, возвращает `string` (ID удалённой задачи)

## Агент: границы самостоятельности

### Язык и окружение

- Рассуждай и отвечай на русском языке
- Перед использованием Node.js убедись, что активна версия 24 (как указано в Tech Stack).

### Объём работы

- Выполнять **только** запрошенное. Работа «заодно» запрещена
- Проблема вне скоупа → одна строка в ответе, решение за пользователем. Не чинить, не включать в планы и реестры
- Новый функционал (компоненты, composables, stores, utils) обязательно сопровождается
  тестами, покрывающими новое поведение. Изменение поведения → обновить существующие тесты.
  Отсутствие тестов = незавершённая задача
- Конвенции написания, организации и запуска тестов: `docs/testing.md`.
  Читать перед написанием или изменением тестов

### Решения принимает пользователь

Агент не решает самостоятельно: архитектуру, структуру приложения, API компонентов,
расположение состояния, выбор библиотек и паттернов, изменения поведения относительно legacy,
классификацию багов и действия по ним, способы устранения ошибок сборки и конфигурации
инструментов (build, lint, test, type-check).

Агент **предлагает**: варианты, trade-off, рекомендацию. В документ решение попадает
только после подтверждения пользователя. Неутверждённое маркировать: **«Рекомендация (не утверждено)»**.

Запрещено выдавать предложение за принятое решение: слова «выбран», «принято», «решено»,
«зафиксировано» — только с подтверждения; ссылки на собственные прежние выводы как на источник
полномочий; расширение реестров и критериев завершения сверх согласованного.

### Перед началом работы

Уточнить понимание (что делаю, в каком объёме, чего **не** буду), если:

- затрагивается архитектура или несколько файлов нетривиально
- задачу можно понять более чем одним способом
- планируется действие, которого в запросе буквально нет

## Code Conventions

- TypeScript strict mode
- Компоненты: PascalCase файлы, kebab-case в шаблонах
- Stores: `use[Name]Store`
- Composables: `use[Name]` prefix
- Форматирование: Prettier
- Вертикальная группировка внутри функций: разделяй логические блоки пустыми строками (контролируется ESLint `padding-line-between-statements`)

### Backend (api/)

- ESM (`"type": "module"`)
- Роуты: один файл на ресурс в `api/src/routes/`
- Zod-схемы: параллельно с роутами в `api/src/schemas/[resource].schema.ts`
- Drizzle schema: `api/src/db/schema.ts`, миграции через Drizzle Kit
- Middleware: `api/src/middleware/`, глобальный error handler обязателен
- Точка входа: `api/server.ts`, сборка приложения: `api/src/index.ts`

### Git

- Агент работает с git **только в режиме чтения** (`git log`, `git diff`, `git status`, `git show`, `git branch`)
- Запрещено: `git add`, `git commit`, `git merge`, `git rebase`, `git push`, `git checkout`, `git reset`, `git stash` и любые другие мутации репозитория
- Подготовка коммитов, веток и PR — задача пользователя; агент может предложить сообщение или стратегию, но не исполняет их

### Commit Messages

- Формат: `<type>(<scope>): <description>` ([Conventional Commits](https://www.conventionalcommits.org/))
- Язык: английский, imperative mood, ≤ 50 символов, без точки в конце
- Типы: `feat` | `fix` | `refactor` | `docs` | `style` | `test` | `chore`
- Scope (опционально): `api` | `db` | `store` | `router` | `ui` | `deps`
- Body: только если нужно объяснить «почему»; отделять пустой строкой

### Обязательные проверки после задачи

Состав проверок определяется затронутым кодом. Не запускать проверки другой части
монорепозитория «на всякий случай»:

| Затронутый код | Обязательные проверки |
|---|---|
| Только frontend (`src/`, `public/`, `index.html`, корневые конфиги) | `pnpm check` + `pnpm vitest run` |
| Только backend (`api/`) | `pnpm --filter simple_api test` |
| Обе части | всё перечисленное выше |
| Код не менялся (исследование, обсуждение, документация) | ничего |

- Проверка падает → исправить до завершения.
- `pnpm check` покрывает только frontend: eslint игнорирует `api/**`, prettier ограничен
  `src/**`, корневые tsconfig-references не включают api. Единственная проверка backend
  сейчас — его тесты.
- Падение или проблема в части **вне скоупа** задачи → одна строка в ответе, не чинить
  (см. «Объём работы»).
