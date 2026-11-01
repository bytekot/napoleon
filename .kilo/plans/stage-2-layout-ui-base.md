# Этап 2: Layout и базовые UI-компоненты

**Статус:** к реализации
**Сложность:** Низкая
**Зависит от:** Этап 0 (готов)
**Блокирует:** Этапы 3, 4
**Параллелизуемо:** с Этапом 1

---

## Объём этапа

### 2.1 Layout — `src/components/layout/Layout.vue`

Обёртка приложения: header, content slot, footer.

Legacy-ориентир: `components/layout/component.tsx`. PrimeVue не нужен — простой контейнер со слотами.

### 2.2 Header / Footer

Legacy: `components/header/component.tsx`, `components/footer/component.tsx`. Проверить при реализации, содержат ли они логику. Если только разметка — оставить статикой внутри `Layout.vue`, отдельные компоненты не создавать.

### 2.3 Button — `src/components/button/AppButton.vue`

База — PrimeVue `<Button>`. Props: `size`, `disabled`. Клик — через emit.

Legacy использует собственный `components/button/component.tsx` с `SIZES`. Сравнить визуально; если PrimeVue-вариант расходится с дизайном — wrapper со своими стилями поверх.

### 2.4 TextArea — `src/components/text-area/AppTextArea.vue`

База — PrimeVue `<Textarea>` или `<InputText>`. Обязательна поддержка `v-model`.

Legacy-поведение, которое нужно сохранить (`components/tasks-form/component.tsx`):
- `emptyText='Что нужно сделать?'` → `placeholder`
- `autoFocus`
- обработка `keydown` для Enter (на Этапе 3)

### 2.5 Иконки

Перенести SVG из `packages/react-app/src/assets/icons/`. В legacy это компоненты с props `size: Size`.

Варианты реализации — выбрать при реализации, зафиксировать решение в этом файле:
- отдельные SFC на каждую иконку
- inline SVG в потребляющих компонентах
- `primeicons`, если есть подходящая замена

Тип `IconProps` уже создан на Этапе 0 (`src/types/shared.ts`).

---

## PrimeVue vs custom

| Компонент | Решение | Причина |
|-----------|---------|---------|
| Button | PrimeVue | Стандартные состояния, темы |
| Textarea / InputText | PrimeVue | Стилизация и поведение из коробки |
| Checkbox | PrimeVue (создаётся на Этапе 3) | Для отметки выполнения |
| Layout, Header, Footer | Custom | Простая разметка со слотами |
| Иконки | Custom | Уникальная для проекта графика |

Согласно `AGENTS.md`: PrimeVue первым, wrapper или кастом при нехватке. Контроль и читаемость приоритетнее покрытия библиотекой.

---

## Стилизация

`<style scoped lang="scss">` в каждом SFC.

Разделение ответственности:
- компонент описывает **только собственный** вид
- позиционирование и внешние отступы задаёт **родитель** — через `style` или класс на корневом элементе

Legacy-стили в `styles.module.scss` переносятся в `<style scoped lang="scss">` с заменой `classNames(...)` на `:class="{ ... }"`.

---

## Открытый вопрос этапа

**Accessibility:** нужна ли ARIA-поддержка в первой версии?

Рекомендация: **нет**, отложить. Обоснование: legacy не содержит ARIA-атрибутов, добавление сейчас расширит объём этапа без видимого результата. PrimeVue даёт базовую доступность своих компонентов бесплатно. Вернуться отдельной задачей после Этапа 7.

Исключение — `<time dateTime="...">` в календаре: это семантика, а не ARIA, и она затрагивается B9 на Этапе 5.

---

## Критерии завершения

- [ ] `Layout.vue` рендерит slot-контент
- [ ] `AppButton.vue` работает, размер и disabled применяются
- [ ] `AppTextArea.vue` поддерживает `v-model`, placeholder и autofocus
- [ ] Иконки перенесены, решение о формате зафиксировано в этом файле
- [ ] Стили в `<style scoped lang="scss">`, соответствуют legacy визуально
- [ ] `pnpm type-check` проходит
- [ ] `pnpm build` проходит

Проверка визуального соответствия: `pnpm dev:react` (:5173) и `pnpm dev:vue` (:5174) параллельно.

---

## Баги legacy

На этот этап багов из реестра не назначено. Реестр — в [индексе](./1793484623270-react-to-vue-migration.md).

---

## Следующий этап

→ [Этап 3: TasksForm и список задач](./stage-3-tasks-form-list.md) (требуется также Этап 1)
