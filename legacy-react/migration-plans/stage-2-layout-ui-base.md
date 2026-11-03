# Этап 2: Layout и базовые UI-компоненты

**Статус:** реализован
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

Legacy: `components/header/component.tsx`, `components/footer/component.tsx`. Оба — пустые div'ы без логики. Оставить статикой внутри `Layout.vue`, отдельные компоненты не создавать.

### 2.3 Button — `src/components/button/Button.vue`

Перенос из legacy `components/button/component.tsx` **как есть**. Props: `disabled`. Клик — через emit. Children — через default slot. Стили переносятся из SCSS Modules.

> Примечание: prop `size` отсутствует в legacy, не добавляется.

### 2.4 TextArea — `src/components/text-area/TextArea.vue`

Перенос из legacy как есть. Обязательна поддержка `v-model`.

Legacy-поведение, которое нужно сохранить (`components/tasks-form/component.tsx`):
- `emptyText='Что нужно сделать?'` → `placeholder`
- `autoFocus`
- обработка `keydown` для Enter (на Этапе 3)

### 2.5 Иконки

Перенести SVG из `packages/react-app/src/assets/icons/`. Тип `IconProps` уже создан на Этапе 0 (`src/types/shared.ts`).

#### Стратегия реализации (зафиксировано)

**BaseIcon SFC со слотом для path** — прямой перенос паттерна из legacy:
- Базовый компонент `src/components/icon/BaseIcon.vue` принимает `size?: Size`, `className?: string`, рендерит `<svg>` с viewBox и default slot для `<path>`
- Каждая конкретная иконка — отдельный SFC, использующий `<BaseIcon>` и передающий `<path>` через slot

#### Список иконок к переносу (6 штук)

| Legacy | Vue SFC | Путь в legacy |
|--------|---------|---------------|
| `CaretLeftIcon` | `CaretLeft.vue` | `assets/icons/caret-left/component.tsx` |
| `CaretRightIcon` | `CaretRight.vue` | `assets/icons/caret-right/component.tsx` |
| `CaretUpIcon` | `CaretUp.vue` | `assets/icons/caret-up/component.tsx` |
| `TasksIcon` | `Tasks.vue` | `assets/icons/tasks/component.tsx` |
| `PlusIcon` | `Plus.vue` | `assets/icons/plus-icon/component.tsx` |
| `TrashIcon` | `Trash.vue` | `assets/icons/trash-icon/component.tsx` |

Базовый wrapper: `BaseIcon.vue` ← legacy `assets/icons/icon/component.tsx`

Все иконки размещаются в `src/components/icon/`.

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

## Открытые вопросы этапа

Нет. Все решения зафиксированы:
- Accessibility (ARIA): **отложено** до завершения Этапа 7. Legacy не содержит ARIA, добавление расширяет объём без видимого результата. Исключение — `<time dateTime="...">` в календаре (семантика, не ARIA; затрагивается B9 на Этапе 5).
- Иконки: **BaseIcon SFC со слотом для path** (см. п. 2.5).
- Button `size`: **не добавляется**, отсутствует в legacy.

---

## Критерии завершения

- [ ] `Layout.vue` рендерит slot-контент, Header/Footer как статика внутри (без отдельных компонентов)
- [ ] `Button.vue` работает: `disabled` применяется, клик через emit, children через slot
- [ ] `TextArea.vue` поддерживает `v-model`, placeholder (`emptyText`) и `autoFocus`
- [ ] `BaseIcon.vue` создан, принимает `size` и слот для path
- [ ] Все 6 иконок перенесены: CaretLeft, CaretRight, CaretUp, Tasks, Plus, Trash
- [ ] Стили в `<style scoped lang="scss">`, соответствуют legacy визуально
- [ ] `pnpm type-check` проходит
- [ ] `pnpm build` проходит

Проверка визуального соответствия: `pnpm dev:react` (:5173) и `pnpm dev:vue` (:5174) параллельно.

---

## Баги legacy

На этот этап багов из реестра не назначено. Реестр — в [индексе](./index.md).

---

## Следующий этап

→ [Этап 3: TasksForm и список задач](./stage-3-tasks-form-list.md) (требуется также Этап 1)
