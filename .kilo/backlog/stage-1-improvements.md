# Этап 1: Предложения по улучшению

Накоплены в ходе код-ревью. Не блокируют завершение этапа, адресуются в follow-up.

---

## M1. `fetchTasks`: повторный вызов после ошибки заблокирован

**Файл:** `packages/vue-app/src/stores/tasks.ts`

Условие `if (this.request.status !== 'idle') return` запрещает повторную загрузку после ошибки сети. Статус `'error'` остаётся навсегда до перезагрузки страницы.

**Варианты решения:**
- Разрешить повтор при `status: 'error'`: `if (status === 'pending' || status === 'success') return`
- Добавить отдельный action `retryFetch()`

---

## M2. `request()` не обрабатывает пустой ответ сервера

**Файл:** `packages/vue-app/src/api/client.ts`

`response.json()` бросит `SyntaxError` на пустом теле ответа (например, `204 No Content`). Сейчас `deleteTask` типизирован как `request<string>` и работает, но изменение API сломает его.

**Вариант:** проверять `content-length` или обернуть парсинг в try/catch с fallback.

---

## M3. Тест `createTask: temp id появляется сразу` использует never-resolving promise

**Файл:** `packages/vue-app/src/stores/__tests__/tasks.spec.ts`

`new Promise(() => {})` никогда не разрешается. Работает для проверки optimistic update, но оставляет висящее состояние. Если vitest добавит проверку на unhandled promises — тест упадёт.

**Вариант:** добавить комментарий о намеренном использовании или использовать timeout-based mock.

---

## M4. Non-null assertions в getter'ах

**Файл:** `packages/vue-app/src/stores/tasks.ts`, getters `unplannedTaskIds`, `taskIdsByDueDate`

Используются `state.entities[a]!` после filter, который гарантирует наличие entity. Корректно в рамках текущего дизайна, но runtime crash возможен при рассинхронизации `ids` и `entities`.

**Вариант:** добавить dev-mode инвариант или defensive check.
