# Frontend Development Guide - Replit UI Style

## Обзор

Данное руководство описывает разработку современного React frontend приложения в стиле Replit для системы Estimate Service. Интерфейс построен с использованием современных технологий и обеспечивает отличный пользовательский опыт.

## Технологический стек

### Основные технологии
- **React 18** - Основная библиотека UI
- **TypeScript** - Типизированный JavaScript
- **Vite** - Сборщик и dev-сервер
- **React Router DOM** - Маршрутизация
- **TanStack Query** - Управление состоянием сервера

### UI/UX библиотеки
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Headless UI** - Несветящиеся UI компоненты
- **Heroicons** - Набор SVG иконок
- **Lucide React** - Дополнительные иконки
- **Framer Motion** - Анимации и переходы

### Утилиты
- **clsx** - Условные CSS классы
- **tailwind-merge** - Умное объединение Tailwind классов
- **React Hook Form** - Управление формами
- **Axios** - HTTP клиент

## Архитектура проекта

```
apps/estimate-frontend/
├── src/
│   ├── components/          # Переиспользуемые компоненты
│   │   ├── ui/             # Базовые UI компоненты
│   │   ├── forms/          # Компоненты форм
│   │   ├── layout/         # Компоненты макета
│   │   └── features/       # Функциональные компоненты
│   ├── pages/              # Страницы приложения
│   ├── hooks/              # Кастомные React хуки
│   ├── contexts/           # React контексты
│   ├── utils/              # Утилитарные функции
│   ├── types/              # TypeScript типы
│   ├── api/                # API интеграция
│   ├── assets/             # Статические ресурсы
│   └── styles/             # Дополнительные стили
├── public/                 # Публичные файлы
└── docs/                   # Документация компонентов
```

## Дизайн система

### Цветовая палитра

#### Основные цвета (в стиле Replit)
- **Primary Blue**: #0ea5e9 (основной синий)
- **Primary Blue Dark**: #0284c7 (темный синий)
- **Success Green**: #10b981 (зеленый успеха)
- **Warning Orange**: #f59e0b (оранжевый предупреждения)
- **Error Red**: #ef4444 (красный ошибки)

#### Нейтральные цвета
- **Dark**: #0f172a - #f8fafc (градации серого)
- **Background Light**: #ffffff (светлый фон)
- **Background Dark**: #0f172a (темный фон)

### Типографика
- **Основной шрифт**: Inter (Google Fonts)
- **Моноширинный**: JetBrains Mono (для кода)

### Размеры и отступы
- **Базовая единица**: 0.25rem (4px)
- **Стандартные отступы**: 4px, 8px, 12px, 16px, 24px, 32px
- **Border radius**: 4px, 8px, 12px

## Компоненты и паттерны

### Базовые компоненты

#### Button
```tsx
// Примеры использования
<Button variant="primary" size="md">Сохранить</Button>
<Button variant="secondary" size="sm">Отмена</Button>
<Button variant="success" icon={CheckIcon}>Готово</Button>
```

#### Input
```tsx
// Различные варианты
<Input placeholder="Введите текст" />
<Input type="email" label="Email" required />
<Input error="Поле обязательно" />
```

#### Card
```tsx
<Card>
  <Card.Header>
    <h3>Заголовок карточки</h3>
  </Card.Header>
  <Card.Body>
    <p>Содержимое карточки</p>
  </Card.Body>
  <Card.Footer>
    <Button>Действие</Button>
  </Card.Footer>
</Card>
```

### Компоненты макета

#### Sidebar
- Боковая панель навигации в стиле Replit
- Поддержка сворачивания/разворачивания
- Адаптивный дизайн
- Темная/светлая тема

#### Header
- Верхняя панель с поиском
- Переключатель темы
- Уведомления
- Профиль пользователя

#### Layout
- Responsive grid система
- Flexbox утилиты
- Container компоненты

### Специализированные компоненты

#### EstimateTable
- Таблица смет с сортировкой
- Фильтрация и поиск
- Пагинация
- Экспорт данных

#### AIChat
- Чат с ИИ-ассистентом
- Поддержка markdown
- История сообщений
- Типизация ответов

#### ProjectCard
- Карточка проекта
- Статус индикаторы
- Действия быстрого доступа

## Состояние и данные

### TanStack Query
```tsx
// Загрузка данных
const { data, isLoading, error } = useQuery({
  queryKey: ['estimates'],
  queryFn: fetchEstimates
})

// Мутации
const mutation = useMutation({
  mutationFn: createEstimate,
  onSuccess: () => {
    queryClient.invalidateQueries(['estimates'])
  }
})
```

### Контексты
```tsx
// Theme Context
const { darkMode, toggleDarkMode } = useTheme()

// Auth Context
const { user, login, logout } = useAuth()
```

## Анимации и интерактивность

### Framer Motion паттерны
```tsx
// Анимация появления
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Контент
</motion.div>

// Hover эффекты
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Кнопка
</motion.button>
```

### Микро-интерактивность
- Hover состояния для всех интерактивных элементов
- Loading состояния с анимацией
- Smooth переходы между страницами
- Feedback для пользовательских действий

## Responsive дизайн

### Breakpoints
- **Mobile**: 640px и меньше
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px и больше
- **Large Desktop**: 1440px и больше

### Адаптивные паттерны
```tsx
// Responsive компоненты
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Conditional rendering
{isMobile ? <MobileSidebar /> : <DesktopSidebar />}
```

## Производительность

### Оптимизация
- **Code splitting** с React.lazy
- **Мемоизация** с React.memo и useMemo
- **Виртуализация** больших списков
- **Debounce** для поиска и фильтрации

### Bundle анализ
```bash
# Анализ размера bundle
npm run build
npm run analyze
```

## Тестирование

### Unit тесты
```tsx
// Пример теста компонента
import { render, screen } from '@testing-library/react'
import Button from './Button'

test('renders button with text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByText('Click me')).toBeInTheDocument()
})
```

### Integration тесты
- Testing Library для компонентов
- MSW для моков API
- Cypress для E2E тестов

## Accessibility (a11y)

### Базовые требования
- Семантическая HTML разметка
- ARIA атрибуты для интерактивных элементов
- Keyboard navigation
- Screen reader поддержка
- Цветовой контраст 4.5:1

### Инструменты
- **eslint-plugin-jsx-a11y** для статического анализа
- **axe-core** для автоматического тестирования
- **Lighthouse** для аудита

## Интернационализация (i18n)

### React i18next
```tsx
// Использование переводов
import { useTranslation } from 'react-i18next'

const Component = () => {
  const { t } = useTranslation()
  return <h1>{t('welcome.title')}</h1>
}
```

### Поддерживаемые языки
- Русский (основной)
- Английский
- Возможность добавления новых языков

## Интеграция с Backend

### API клиент
```tsx
// Axios конфигурация
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000
})

// Типизированные запросы
interface EstimateResponse {
  estimates: Estimate[]
  total: number
}

const fetchEstimates = (): Promise<EstimateResponse> =>
  apiClient.get('/estimates').then(res => res.data)
```

### Обработка ошибок
```tsx
// Error Boundary для React ошибок
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// API ошибки с Toast уведомлениями
const { mutate, error } = useMutation({
  onError: (error) => {
    toast.error(error.message)
  }
})
```

## Development workflow

### Запуск проекта
```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Сборка для production
npm run build

# Запуск тестов
npm run test
```

### Код стандарты
- **ESLint** для статического анализа
- **Prettier** для форматирования
- **Husky** для git hooks
- **Conventional Commits** для сообщений коммитов

### Стайл гайд
- Используйте TypeScript строго
- Компоненты в PascalCase
- Хуки начинаются с "use"
- Константы в UPPER_SNAKE_CASE
- CSS классы следуют BEM при необходимости

## Деплой и CI/CD

### Build процесс
```bash
# Production build
npm run build

# Анализ bundle
npm run build:analyze

# Проверка типов
npm run type-check
```

### Environment переменные
```env
VITE_API_URL=http://localhost:3022
VITE_APP_VERSION=1.0.0
VITE_SENTRY_DSN=your_sentry_dsn
```

### Docker
```dockerfile
# Multi-stage build для оптимизации
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
```

## Мониторинг и метрики

### Производительность
- **Core Web Vitals** мониторинг
- **Sentry** для error tracking
- **Lighthouse CI** для автоматических аудитов

### Аналитика
- User interaction tracking
- Performance metrics
- Error reporting

## Заключение

Данный фронтенд построен с использованием современных технологий и best practices. Архитектура обеспечивает:

- **Масштабируемость** - легко добавлять новые компоненты и страницы
- **Поддерживаемость** - четкая структура и типизация
- **Производительность** - оптимизированная сборка и загрузка
- **UX** - плавные анимации и отзывчивый интерфейс
- **DX** - удобная разработка с hot reload и TypeScript

Следуйте данному руководству для создания качественного и современного пользовательского интерфейса.
