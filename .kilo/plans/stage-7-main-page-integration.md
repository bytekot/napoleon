# Этап 7: MainPage и финальная интеграция

**Сложность:** Низкая
**Зависит от:** Все предыдущие

---

## Задачи

1. MainPage (`src/views/MainPage.vue`)
   - Composition: TasksForm + Calendar
   - Load tasks on mount (`store.fetchTasks`)
2. Роутинг
   - `/` → MainPage
   - Удалить ненужные routes
3. Styling polish
   - Responsive layout
   - SCSS modules или CSS variables
4. Error handling
   - Global error boundary (Vue ErrorBoundary component)
   - Toast notifications для API ошибок (PrimeVue Toast)

---

## Баги legacy

Реализуются на этом этапе. Описание — в [индексе, реестр багов](./1793484623270-react-to-vue-migration.md).

| Баг | Что относится к этапу |
|-----|----------------------|
| B4 | Загрузка задач на маунте: не повторять legacy-паттерн `useEffect` без массива зависимостей |

---

## Критерии завершения

- [ ] Приложение загружается и показывает задачи
- [ ] Все CRUD операции работают
- [ ] Calendar navigation работает
- [ ] Drag-and-drop работает
- [ ] Визуальное соответствие React версии
- [ ] `pnpm type-check` проходит
- [ ] `pnpm build` succeeds

---

→ [Индекс плана](./1793484623270-react-to-vue-migration.md)
