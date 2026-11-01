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

Legacy-ориентир: `components/layout/component.tsx`. Простой контейнер со слотами.

### 2.2 Header / Footer

Legacy: `components/header/component.tsx`, `components/footer/component.tsx`. Проверить при реализации, содержат ли они логику. Если только разметка — оставить статикой внутри `Layout.vue`, отдельные компоненты не создавать.

### 2.3 Button — `src/components/button/AppButton.vue`

Перенос из legacy `components/button/component.tsx` как есть. Props: `size`, `disabled`. Клик — через emit. Стили переносятся из SCSS Modules.

### 2.4 TextArea — `src/components/text-area/AppTextArea.vue`

Перенос из legacy как есть. Обязательна поддержка `v-model`.

Legacy-поведение, которое нужно сохранить (`components/tasks-form/component.tsx`):
- `emptyText='Что нужно сделать?'` → `placeholder`
- `autoFocus`
- обработка `keydown` для Enter (на Этапе 3)

### 2.5 Иконки

Перенести SVG из `packages/react-app/src/assets/icons/`. В legacy это компоненты с props `size: Size`.

Варианты реализации — выбрать при реализации, зафиксировать решение в этом файле:
- отдельные SFC на каждую иконку
- inline SVG в потребляющих компонентах

Тип `IconProps` уже создан на Этапе 0 (`src/types/shared.ts`).

---

## UI-стратегия этапа

Все компоненты переносятся из React как есть, без использования UI-библиотек. Стили переносятся из legacy SCSS Modules в `<style scoped lang="scss">`.

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

Рекомендация: **нет**, отложить. Обоснование: legacy не содержит ARIA-атрибутов, добавление сейчас расширит объём этапа без видимого результата. Вернуться отдельной задачей после Этапа 7.

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
