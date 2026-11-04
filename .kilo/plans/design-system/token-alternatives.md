# Token Alternatives (Playground)

Этот файл содержит все альтернативные варианты токенов для экспериментов. Активные значения — в `src/styles/theme.scss`.

---

## Shadow: Card

**Активный:** Вариант C (teal-оттенок под календарь)
```scss
--shadow-card: 0 2px 8px rgba(6, 38, 56, 0.08), 0 1px 3px rgba(6, 38, 56, 0.05);
```

**Альтернативы:**

- **Вариант A (нейтральная):**
  ```scss
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  ```

- **Вариант B ("бумажная"):**
  ```scss
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08);
  ```

- **Вариант D (green-оттенок под сайдбар):**
  ```scss
  --shadow-card-sidebar: 0 2px 8px rgba(76, 136, 126, 0.1), 0 1px 3px rgba(76, 136, 126, 0.06);
  ```

**Примечание:** тень должна быть адаптивной — разной в календаре (фон `#f9f6f0`) и форме (фон `#d5e5dd`).

---

## Shadow: Input

**Активный:** Вариант B (адаптация текущего стиля)
```scss
--shadow-input-inset: 
  inset 1px 1px 2px 0 rgba(141, 171, 160, 0.3),
  inset -1px -1px 2px 0 rgba(216, 232, 222, 0.5),
  inset 0 -3px 0 0 var(--color-input-border-bottom-3);
```

**Альтернативы:**

- **Вариант A (многослойный, точная реконструкция мокапа):**
  ```scss
  --shadow-input-inset: 
    // Верхний бордер (5 слоёв)
    inset 0 1px 0 #dae8e0,
    inset 0 2px 0 #d0e3d9,
    inset 0 3px 0 #8daba0,
    inset 0 4px 0 #9fbab0,
    inset 0 5px 0 #b5cac0,
    // Градиентная тень вниз (эмуляция)
    inset 0 6px 2px -2px rgba(181, 202, 192, 0.8),
    inset 0 8px 4px -2px rgba(181, 202, 192, 0.6),
    inset 0 10px 6px -2px rgba(181, 202, 192, 0.4),
    // Нижний бордер (6 слоёв)
    inset 0 -1px 0 #d8e8de,
    inset 0 -2px 0 #bbd2c8,
    inset 0 -3px 0 #afc8be,
    inset 0 -4px 0 #dbe9e2,
    inset 0 -5px 0 #e7f2eb,
    inset 0 -6px 0 #d1e2da;
  ```

- **Вариант C (гибрид border + gradient + shadow):**
  ```scss
  .input {
    border-top: 3px solid #8daba0;
    border-bottom: 3px solid #afc8be;
    background: linear-gradient(
      to bottom,
      #dae8e0 0%,
      #d0e3d9 10%,
      transparent 20%,
      transparent 80%,
      #dbe9e2 90%,
      #e7f2eb 100%
    );
    box-shadow: 
      inset 0 4px 8px -2px rgba(181, 202, 192, 0.4),
      inset 0 -2px 4px -1px rgba(216, 232, 222, 0.3);
  }
  ```

---

## Shadow: Separator (форма задач)

**Активный:** Inset shadow с бликом
```scss
--shadow-separator-inset: 
  inset 0 1px 0 var(--color-green-150),
  inset 0 -1px 0 var(--color-green-150),
  0 1px 0 var(--color-green-50);
```

**Альтернативы:**

- **Вариант A (background + box-shadow для div-based сепаратора):**
  ```scss
  .separator {
    height: 1px;
    background: var(--color-green-200);
    box-shadow: 
      0 -1px 0 var(--color-green-150),
      0 1px 0 var(--color-green-150),
      0 2px 0 var(--color-green-50);
  }
  ```

---

## Color: Danger (просроченная полоска)

**Активный:** Мягкий красный/розовый
```scss
--color-bg-danger: #f8a4a3;
```

**Альтернативы:**

- **Прежнее значение (Этап 1):**
  ```scss
  --color-bg-danger: rgba(255, 0, 0, 0.2);
  ```

---

## Color: Text Day (цифры дней календаря)

**Активный:** Teal с opacity
```scss
--color-text-day: rgba(6, 38, 56, 0.5);
```

**Альтернативы:**

- **Более тёмный ink:**
  ```scss
  --color-text-day: rgba(1, 37, 55, 0.5);  // #012537 с opacity
  ```

- **Прежнее значение (Этап 1):**
  ```scss
  --color-text-day: #00000081;  // нейтральный чёрный с opacity
  ```

---

## Color: Ink (основной тёмный текст)

**Активный:** Dark teal
```scss
--color-ink-900: #062638;
```

**Альтернативы:**

- **Более тёмный:**
  ```scss
  --color-ink-900: #012537;
  ```

---

## Spacing: Маппинг (справочно)

| Текущее (Этап 1) | Новое (Этап 2) | Обоснование |
|------------------|----------------|-------------|
| 5px | 4px (`--space-xxs`) | Ближайшее кратное вниз |
| 10px | 8px (`--space-xs`) | Ближайшее кратное |
| 12.5px | 8px (`--space-xs`) | Округление вниз |
| 15px | 16px (`--space-s`) | Ближайшее кратное |
| 20px | 16px (`--space-s`) | Ближайшее кратное вниз |
| 30px | 32px (`--space-l`) | Ближайшее кратное |

---

## История изменений

- **2026-11-04:** Начальная версия. Активные варианты: Card (C), Input (B), Separator (inset), Danger (#f8a4a3), Text Day (rgba teal 0.5), Ink (#062638).
