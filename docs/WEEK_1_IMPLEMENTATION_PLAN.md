# План реализации: Неделя 1 - Core Components

## День 1: Настройка инфраструктуры компонентов

### Утро (4 часа)
1. **Создание структуры папок для UI компонентов**
   ```bash
   mkdir -p apps/estimate-frontend/src/components/ui/{Card,Badge,Button,Loading,Navigation,Notifications}
   ```

2. **Создание базовых типов для компонентов**
   ```typescript
   // apps/estimate-frontend/src/types/ui.types.ts
   export interface BaseComponentProps {
     className?: string;
     children?: React.ReactNode;
     testId?: string;
   }
   
   export type Variant = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
   export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
   ```

3. **Настройка Storybook**
   ```bash
   cd apps/estimate-frontend
   npx storybook@latest init
   ```

### После обеда (4 часа)
1. **Создание Button компонента**
   - Button.tsx с вариантами и размерами
   - IconButton.tsx для иконок
   - Button.stories.tsx для Storybook

2. **Создание Spinner компонента**
   - Spinner.tsx с размерами и цветами
   - Интеграция с design-system стилями
   - Spinner.stories.tsx

---

## День 2: Card компоненты

### Утро (4 часа)
1. **Базовый Card компонент**
   ```typescript
   // Card.tsx
   - CardHeader
   - CardBody
   - CardFooter
   - Card compound component
   ```

2. **Card стили из design-system**
   - Интеграция классов из components-usage.md
   - Темная тема поддержка
   - Анимации hover

### После обеда (4 часа)
1. **MetricCard компонент**
   - Иконка, значение, метка, тренд
   - Цветовые варианты для трендов
   - Анимация при изменении значений

2. **StatusCard компонент**
   - Цветовая индикация статуса
   - Интеграция с EstimateStatus типами
   - Hover эффекты

---

## День 3: Badge и Tag компоненты

### Утро (4 часа)
1. **Badge компонент**
   ```typescript
   // Badge.tsx
   - Варианты: draft, pending, approved, rejected
   - Размеры: sm, md, lg
   - С иконкой и без
   ```

2. **RoleBadge компонент**
   - Специфичные стили для ролей
   - Иконки ролей
   - Tooltip с описанием

### После обеда (4 часа)
1. **Tag компонент**
   - Обычные и удаляемые теги
   - TagGroup для групп
   - Анимация удаления

2. **CountBadge компонент**
   - Плавающие бейджи
   - Анимация появления
   - Максимальное значение (99+)

---

## День 4: Loading состояния

### Утро (4 часа)
1. **Skeleton компоненты**
   ```typescript
   // Skeleton.tsx
   - SkeletonText
   - SkeletonCard
   - SkeletonTable
   - SkeletonAvatar
   ```

2. **Анимации skeleton**
   - Pulse эффект
   - Shimmer эффект
   - Настраиваемая скорость

### После обеда (4 часа)
1. **LoadingOverlay компонент**
   - Полноэкранный и локальный
   - С текстом загрузки
   - Прогресс бар опция

2. **Интеграция в существующие страницы**
   - Замена "Загрузка..." на Skeleton
   - Добавление LoadingOverlay в формы
   - Оптимизация UX

---

## День 5: Интеграция и тестирование

### Утро (4 часа)
1. **Обновление Dashboard**
   - Замена div на MetricCard
   - Добавление Skeleton при загрузке
   - Интеграция Badge для статусов

2. **Обновление Estimates**
   - StatusBadge в таблице
   - Button компоненты
   - LoadingOverlay при операциях

### После обеда (4 часа)
1. **Написание тестов**
   - Unit тесты для каждого компонента
   - Snapshot тесты
   - Accessibility тесты

2. **Документация**
   - README для ui папки
   - Примеры использования
   - Best practices

---

## Чеклист на конец недели

### Компоненты созданы:
- [ ] Button (+ IconButton)
- [ ] Card (+ MetricCard, StatusCard)
- [ ] Badge (+ RoleBadge, StatusBadge)
- [ ] Tag (+ TagGroup)
- [ ] Spinner
- [ ] Skeleton (все варианты)
- [ ] LoadingOverlay

### Интеграция:
- [ ] Storybook настроен и работает
- [ ] Компоненты используют design-system стили
- [ ] Dashboard обновлен новыми компонентами
- [ ] Estimates обновлен новыми компонентами

### Качество:
- [ ] Все компоненты имеют stories
- [ ] Написаны unit тесты
- [ ] Поддержка темной темы
- [ ] TypeScript типы определены
- [ ] Accessibility проверена

---

## Полезные команды

```bash
# Запуск Storybook
npm run storybook

# Запуск тестов
npm test

# Проверка типов
npm run type-check

# Проверка accessibility
npm run test:a11y
```

---

## Примеры кода для быстрого старта

### Button компонент
```typescript
import React from 'react';
import { BaseComponentProps, Variant, Size } from '../../types/ui.types';

interface ButtonProps extends BaseComponentProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  onClick,
  testId,
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn-${variant}`;
  const sizeClasses = `btn-${size}`;
  const stateClasses = loading ? 'btn-loading' : '';
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${stateClasses} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid={testId}
    >
      {loading && <Spinner size="sm" className="btn-loading-spinner" />}
      <span className={loading ? 'btn-loading-text' : ''}>{children}</span>
    </button>
  );
};
```

### MetricCard компонент
```typescript
import React from 'react';
import { Card } from './Card';

interface MetricCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  value,
  label,
  trend,
  className = '',
}) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-card-icon">{icon}</div>
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-label">{label}</div>
      {trend && (
        <div className={`metric-card-change ${trend.isPositive ? 'metric-card-change-positive' : 'metric-card-change-negative'}`}>
          <svg>{/* стрелка */}</svg>
          <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
        </div>
      )}
    </div>
  );
};
```
