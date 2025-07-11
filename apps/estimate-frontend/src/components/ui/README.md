# UI Components

Этот раздел содержит основные переиспользуемые компоненты для фронтенда проекта, реализованные с учетом best practices, поддержки темной темы, accessibility и интеграции с design-system.

## Структура

- `Button`, `IconButton`
- `Card`, `MetricCard`, `StatusCard`
- `Badge`, `RoleBadge`, `StatusBadge`, `CountBadge`
- `Tag`, `TagGroup`
- `Spinner`, `Skeleton`, `LoadingOverlay`, `DashboardSkeleton`, `FormWithLoading`

## Использование

```tsx
import { Button } from '../components/ui/Button/Button';

<Button variant="primary" size="md">Сохранить</Button>
```

## Best Practices
- Используйте типы из `ui.types.ts` для единообразия пропсов.
- Для новых статусов, ролей и вариантов расширяйте типы и маппинги.
- Все компоненты покрыты stories для Storybook и unit-тестами.
- Стилизация через design-system и tailwind-классы.
- Поддержка accessibility (aria, role, фокусировка).
- Для загрузки используйте Skeleton/LoadingOverlay вместо "Загрузка...".

## Тестирование
- Для unit-тестов используйте Jest/React Testing Library.
- Для визуальных тестов — Storybook.

## Темная тема
- Используйте tailwind dark: классы или соответствующие переменные design-system.

## Контрибьюция
- Добавляйте новые компоненты в соответствующую папку.
- Обновляйте stories и тесты при изменениях.
- Следуйте паттернам и соглашениям текущих компонентов.
