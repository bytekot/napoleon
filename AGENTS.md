# Napoleon

Task board с календарём. Миграция с React на Vue (in progress).

## Tech Stack

- **Frontend (target):** Vue 3, TypeScript, Pinia, Vue Router, PrimeVue
- **Frontend (legacy):** React 18, Redux Toolkit, SCSS Modules
- **Backend:** Express.js REST API, in-memory storage (стабильный, не меняется)
- **Build:** Vite, pnpm workspaces
- **Runtime:** Node v24 LTS (через nvm), pnpm 12.x

## Repository Structure

```
napoleon/
├── api/                 # backend (shared)
├── packages/
│   ├── react-app/       # legacy, read-only reference
│   └── vue-app/         # active development
├── package.json         # workspace root scripts
└── pnpm-workspace.yaml
```

## Development Commands

```bash
pnpm dev:react       # localhost:5173
pnpm dev:vue         # localhost:5174
pnpm start-server    # API :3001
```

Оба фронтенда запускаются параллельно для визуального сравнения.

## Architecture Decisions

- **State Management:** Pinia (не Vuex)
- **UI Library:** PrimeVue (выбран за Calendar/DnD компоненты)
- **Store structure:** entity-based для задач (обосновано CRUD + ID lookup; не догма для всех сущностей)
- **Composition API** + `<script setup>`

## UI Library Strategy

1. Сначала пробуем PrimeVue компонент
2. Не хватает функциональности → кастомный компонент или wrapper
3. PrimeVue решает ~80% задачи → используем его + слоты/props для кастомизации
4. С полностью уникальные компоненты (calendar-day, task с DnD) разбираемся в частном порядке
5. Контроль и читаемость приоритетнее покрытия библиотекой

## Migration Guidelines

- Legacy React — только reference, не модифицировать
- Бизнес-логика → composables/stores
- Типы адаптируются под Vue; предложения по улучшению TS приветствуются и обсуждаются перед применением

## Code Conventions

- TypeScript strict mode
- Компоненты: PascalCase файлы, kebab-case в шаблонах
- Stores: `use[Name]Store`
- Composables: `use[Name]` prefix
