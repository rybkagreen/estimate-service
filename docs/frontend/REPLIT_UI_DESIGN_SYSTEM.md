# Replit UI Design System

## Обзор

Этот документ описывает дизайн-систему для frontend приложения в стиле Replit - современного, минималистичного и функционального интерфейса.

## Философия дизайна

### Принципы
- **Минимализм**: Чистый, незагроможденный интерфейс
- **Функциональность**: Каждый элемент имеет четкое назначение
- **Консистентность**: Единообразие во всех компонентах
- **Адаптивность**: Поддержка всех устройств и экранов
- **Доступность**: Соответствие стандартам A11Y

### Цветовая палитра

```css
/* Основные цвета */
--color-primary: #0969da;        /* Синий */
--color-primary-hover: #0860ca;  /* Темнее синий */
--color-secondary: #6f42c1;      /* Фиолетовый */

/* Семантические цвета */
--color-success: #1a7f37;        /* Зеленый */
--color-warning: #d1242f;        /* Красный */
--color-error: #cf222e;          /* Ошибка */
--color-info: #0969da;           /* Информация */

/* Нейтральные цвета (Light Mode) */
--color-text-primary: #24292f;   /* Основной текст */
--color-text-secondary: #656d76; /* Вторичный текст */
--color-text-muted: #8b949e;     /* Приглушенный текст */
--color-border: #d0d7de;         /* Границы */
--color-border-muted: #d8dee4;   /* Приглушенные границы */
--color-canvas: #ffffff;         /* Фон */
--color-canvas-subtle: #f6f8fa;  /* Тонкий фон */

/* Нейтральные цвета (Dark Mode) */
--color-text-primary-dark: #f0f6fc;   /* Основной текст */
--color-text-secondary-dark: #9198a1; /* Вторичный текст */
--color-text-muted-dark: #7d8590;     /* Приглушенный текст */
--color-border-dark: #30363d;         /* Границы */
--color-border-muted-dark: #21262d;   /* Приглушенные границы */
--color-canvas-dark: #0d1117;         /* Фон */
--color-canvas-subtle-dark: #161b22;  /* Тонкий фон */
```

### Типографика

```css
/* Шрифты */
--font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-family-mono: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace;

/* Размеры текста */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Высота строки */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;

/* Толщина шрифта */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Отступы и размеры

```css
/* Отступы */
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-5: 1.25rem;   /* 20px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-10: 2.5rem;   /* 40px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */

/* Радиусы скругления */
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */

/* Тени */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

## Компоненты UI

### Кнопки

```css
/* Базовая кнопка */
.btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

/* Варианты */
.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply bg-dark-200 text-dark-900 hover:bg-dark-300 focus:ring-dark-500;
}

.btn-outline {
  @apply border-dark-300 text-dark-700 hover:bg-dark-50 focus:ring-primary-500;
}

.btn-ghost {
  @apply text-dark-600 hover:bg-dark-100 focus:ring-primary-500;
}

/* Размеры */
.btn-sm {
  @apply px-3 py-1.5 text-xs;
}

.btn-lg {
  @apply px-6 py-3 text-base;
}
```

### Поля ввода

```css
.input {
  @apply block w-full px-3 py-2 border border-dark-300 rounded-md shadow-sm placeholder-dark-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors;
}

.input-error {
  @apply border-error-500 focus:ring-error-500 focus:border-error-500;
}

.input-success {
  @apply border-success-500 focus:ring-success-500 focus:border-success-500;
}
```

### Карточки

```css
.card {
  @apply bg-white rounded-lg shadow-md border border-dark-200 overflow-hidden;
}

.card-header {
  @apply px-6 py-4 border-b border-dark-200 bg-dark-50;
}

.card-body {
  @apply px-6 py-4;
}

.card-footer {
  @apply px-6 py-4 border-t border-dark-200 bg-dark-50;
}
```

## Анимации

### Переходы

```css
/* Базовые переходы */
.transition-base {
  @apply transition-all duration-200 ease-in-out;
}

.transition-colors {
  @apply transition-colors duration-150 ease-in-out;
}

.transition-transform {
  @apply transition-transform duration-200 ease-in-out;
}

/* Hover эффекты */
.hover-lift {
  @apply hover:-translate-y-1 hover:shadow-lg;
}

.hover-scale {
  @apply hover:scale-105;
}
```

### Framer Motion варианты

```typescript
// Анимации появления
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 }
}

export const slideIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: 0.2 }
}

// Анимации списков
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}
```

## Иконки

### Heroicons
Используем Heroicons для всех иконок:
- **Outline**: для основных элементов интерфейса
- **Solid**: для акцентов и активных состояний

### Размеры иконок
```css
.icon-xs { @apply w-3 h-3; }    /* 12px */
.icon-sm { @apply w-4 h-4; }    /* 16px */
.icon-md { @apply w-5 h-5; }    /* 20px */
.icon-lg { @apply w-6 h-6; }    /* 24px */
.icon-xl { @apply w-8 h-8; }    /* 32px */
```

## Адаптивность

### Breakpoints
```css
/* Mobile first подход */
sm: '640px',    /* Маленькие планшеты */
md: '768px',    /* Планшеты */
lg: '1024px',   /* Ноутбуки */
xl: '1280px',   /* Десктопы */
2xl: '1536px'   /* Большие экраны */
```

### Сетка
```css
/* Container */
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
  max-width: 1280px;
}

/* Grid */
.grid-responsive {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6;
}
```

## Темная тема

### Классы для темной темы
```css
/* Автоматическое переключение цветов */
.text-primary {
  @apply text-dark-900 dark:text-dark-100;
}

.text-secondary {
  @apply text-dark-600 dark:text-dark-400;
}

.bg-surface {
  @apply bg-white dark:bg-dark-800;
}

.border-default {
  @apply border-dark-200 dark:border-dark-700;
}
```

## Accessibility (A11Y)

### Обязательные требования
1. **Semantic HTML**: используйте правильные HTML-теги
2. **Alt текст**: для всех изображений
3. **ARIA labels**: для интерактивных элементов
4. **Focus states**: видимые состояния фокуса
5. **Color contrast**: минимум 4.5:1 для обычного текста
6. **Keyboard navigation**: полная поддержка клавиатуры

### Утилиты A11Y
```css
/* Screen reader only */
.sr-only {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0;
}

/* Focus styles */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2;
}
```

## Performance

### Рекомендации
1. **Lazy loading**: для изображений и компонентов
2. **Code splitting**: разделение на чанки
3. **Tree shaking**: удаление неиспользуемого кода
4. **Image optimization**: сжатие и modern форматы
5. **Bundle analysis**: анализ размера бандла

### Мониторинг
- Lighthouse CI для автоматической проверки
- Core Web Vitals метрики
- Bundle size tracking

## Инструменты разработки

### Storybook
- Изолированная разработка компонентов
- Документация с примерами
- Тестирование в разных состояниях

### Chromatic
- Визуальное тестирование
- Автоматическое обнаружение изменений UI
- Интеграция с CI/CD

### Плагины VSCode
- Tailwind CSS IntelliSense
- Headwind (сортировка классов)
- ES7+ React/Redux/React-Native snippets
