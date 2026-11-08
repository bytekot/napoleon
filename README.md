# Napoleon

Task board with calendar and drag-and-drop UX.
Vue 3 + Pinia + Hono + SQLite.

## Prerequisites

- Node.js v24 LTS
- pnpm 12.x

## Setup

```bash
pnpm install
cp .env.example .env   # DATABASE_URL required (default: ./data/napoleon.db)
pnpm --filter simple_api db:migrate
```

## Development

```bash
pnpm start    # Frontend :5173 + API :3001
```
