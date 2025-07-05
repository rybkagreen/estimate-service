# Руководство по компонентам UI

## Обзор

Библиотека компонентов построена в стиле Replit с использованием Tailwind CSS, Headless UI и современных React паттернов. Все компоненты полностью типизированы и поддерживают темную/светлую тему.

## Базовые компоненты

### Button

Универсальный компонент кнопки с множественными вариантами оформления.

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  children: React.ReactNode
  onClick?: () => void
}

// Примеры использования
<Button variant="primary" size="md">
  Сохранить смету
</Button>

<Button variant="secondary" icon={PlusIcon} iconPosition="left">
  Добавить позицию
</Button>

<Button variant="success" loading={isSubmitting}>
  Отправить на согласование
</Button>
```

**Стили:**
- `btn-primary` - Основная кнопка (синий фон)
- `btn-secondary` - Вторичная кнопка (серый фон)
- `btn-success` - Кнопка успеха (зеленый фон)
- `btn-warning` - Кнопка предупреждения (оранжевый фон)
- `btn-error` - Кнопка ошибки (красный фон)

### Input

Компонент для ввода текста с поддержкой валидации и различных типов.

```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  label?: string
  placeholder?: string
  value?: string
  defaultValue?: string
  error?: string
  success?: string
  required?: boolean
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconPosition?: 'left' | 'right'
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

// Примеры использования
<Input
  label="Название сметы"
  placeholder="Введите название..."
  required
  error={errors.name?.message}
/>

<Input
  type="number"
  label="Стоимость"
  icon={CurrencyDollarIcon}
  iconPosition="left"
  value={price}
  onChange={(e) => setPrice(e.target.value)}
/>
```

### Card

Контейнер для группировки связанного контента.

```tsx
interface CardProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

// Примеры использования
<Card hover>
  <Card.Header>
    <h3 className="text-lg font-semibold">Смета №001</h3>
    <Badge variant="success">Утверждена</Badge>
  </Card.Header>
  <Card.Body>
    <p>Строительство офисного здания</p>
    <div className="flex justify-between mt-4">
      <span>Общая стоимость:</span>
      <span className="font-bold">2 450 000 ₽</span>
    </div>
  </Card.Body>
  <Card.Footer>
    <Button variant="secondary" size="sm">Просмотр</Button>
    <Button variant="primary" size="sm">Редактировать</Button>
  </Card.Footer>
</Card>
```

### Modal

Модальное окно с backdrop и анимациями.

```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnBackdrop?: boolean
  children: React.ReactNode
}

// Пример использования
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Создать новую смету"
  size="lg"
>
  <EstimateForm onSubmit={handleSubmit} />
</Modal>
```

### Table

Таблица с поддержкой сортировки, фильтрации и пагинации.

```tsx
interface TableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  pagination?: PaginationConfig
  sortable?: boolean
  filterable?: boolean
  selectable?: boolean
  onRowClick?: (item: T) => void
}

// Пример использования
const columns = [
  {
    key: 'name',
    title: 'Название',
    sortable: true,
    render: (item) => <span className="font-medium">{item.name}</span>
  },
  {
    key: 'status',
    title: 'Статус',
    render: (item) => <Badge variant={item.status}>{item.statusText}</Badge>
  },
  {
    key: 'actions',
    title: 'Действия',
    render: (item) => (
      <div className="flex space-x-2">
        <Button size="sm" variant="secondary">Редактировать</Button>
        <Button size="sm" variant="error">Удалить</Button>
      </div>
    )
  }
]

<Table
  data={estimates}
  columns={columns}
  loading={isLoading}
  pagination={{
    page: currentPage,
    pageSize: 10,
    total: totalItems,
    onChange: setCurrentPage
  }}
  sortable
  filterable
/>
```

## Компоненты форм

### FormField

Wrapper для полей формы с лейблами и ошибками.

```tsx
interface FormFieldProps {
  label?: string
  error?: string
  success?: string
  required?: boolean
  children: React.ReactNode
}

<FormField label="Email" error={errors.email} required>
  <Input type="email" placeholder="your@email.com" />
</FormField>
```

### Select

Выпадающий список с поиском и множественным выбором.

```tsx
interface SelectProps<T> {
  options: SelectOption<T>[]
  value?: T | T[]
  placeholder?: string
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  disabled?: boolean
  loading?: boolean
  onChange: (value: T | T[]) => void
}

<Select
  options={[
    { value: 'draft', label: 'Черновик' },
    { value: 'review', label: 'На рассмотрении' },
    { value: 'approved', label: 'Утверждена' }
  ]}
  value={status}
  placeholder="Выберите статус"
  onChange={setStatus}
  searchable
/>
```

### DatePicker

Выбор даты с календарем.

```tsx
interface DatePickerProps {
  value?: Date
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
  format?: string
  onChange: (date: Date | null) => void
}

<DatePicker
  value={selectedDate}
  placeholder="Выберите дату"
  minDate={new Date()}
  onChange={setSelectedDate}
/>
```

## Компоненты обратной связи

### Toast

Уведомления для пользователя.

```tsx
// Использование через hook
const { toast } = useToast()

// Различные типы
toast.success('Смета успешно сохранена!')
toast.error('Ошибка при сохранении сметы')
toast.warning('Проверьте введенные данные')
toast.info('Новая версия приложения доступна')

// С дополнительными опциями
toast.success('Операция выполнена', {
  duration: 5000,
  action: {
    label: 'Отменить',
    onClick: handleUndo
  }
})
```

### Loading

Индикаторы загрузки.

```tsx
// Spinner
<Loading size="sm" />
<Loading size="md" />
<Loading size="lg" />

// Skeleton
<Skeleton height={20} />
<Skeleton height={40} width="60%" />

// Progress bar
<Progress value={75} max={100} />
```

### Badge

Небольшие метки статуса.

```tsx
<Badge variant="success">Активна</Badge>
<Badge variant="warning">Ожидает</Badge>
<Badge variant="error">Отклонена</Badge>
<Badge variant="info">Новая</Badge>
```

## Навигационные компоненты

### Breadcrumb

Хлебные крошки для навигации.

```tsx
<Breadcrumb>
  <Breadcrumb.Item href="/">Главная</Breadcrumb.Item>
  <Breadcrumb.Item href="/projects">Проекты</Breadcrumb.Item>
  <Breadcrumb.Item active>Смета №001</Breadcrumb.Item>
</Breadcrumb>
```

### Tabs

Вкладки для переключения контента.

```tsx
<Tabs defaultValue="general">
  <Tabs.List>
    <Tabs.Tab value="general">Общие</Tabs.Tab>
    <Tabs.Tab value="materials">Материалы</Tabs.Tab>
    <Tabs.Tab value="labor">Работы</Tabs.Tab>
  </Tabs.List>

  <Tabs.Content value="general">
    <GeneralInfo />
  </Tabs.Content>
  <Tabs.Content value="materials">
    <MaterialsList />
  </Tabs.Content>
  <Tabs.Content value="labor">
    <LaborList />
  </Tabs.Content>
</Tabs>
```

### Pagination

Пагинация для больших списков.

```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  showInfo
  showSizeChanger
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

## Специализированные компоненты

### EstimateCard

Карточка сметы с основной информацией.

```tsx
interface EstimateCardProps {
  estimate: Estimate
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onView?: (id: string) => void
}

<EstimateCard
  estimate={estimate}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onView={handleView}
/>
```

### AIChat

Чат с ИИ-ассистентом.

```tsx
interface AIChatProps {
  messages: ChatMessage[]
  loading?: boolean
  onSendMessage: (message: string) => void
  onClearHistory?: () => void
}

<AIChat
  messages={chatMessages}
  loading={isGenerating}
  onSendMessage={handleSendMessage}
  onClearHistory={handleClearHistory}
/>
```

### FileUpload

Загрузка файлов с drag & drop.

```tsx
interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onUpload: (files: File[]) => void
  onError?: (error: string) => void
}

<FileUpload
  accept=".pdf,.xlsx,.docx"
  multiple
  maxSize={10 * 1024 * 1024} // 10MB
  onUpload={handleFileUpload}
  onError={handleUploadError}
/>
```

## Responsive компоненты

### ResponsiveContainer

Адаптивный контейнер для разных размеров экрана.

```tsx
<ResponsiveContainer>
  <ResponsiveContainer.Mobile>
    <MobileLayout />
  </ResponsiveContainer.Mobile>

  <ResponsiveContainer.Desktop>
    <DesktopLayout />
  </ResponsiveContainer.Desktop>
</ResponsiveContainer>
```

### Grid

Сетка с responsive настройками.

```tsx
<Grid cols={1} mdCols={2} lgCols={3} gap={6}>
  {items.map(item => (
    <GridItem key={item.id}>
      <ItemCard item={item} />
    </GridItem>
  ))}
</Grid>
```

## Анимированные компоненты

### AnimatedList

Список с анимацией появления элементов.

```tsx
<AnimatedList>
  {items.map((item, index) => (
    <AnimatedList.Item key={item.id} index={index}>
      <ItemComponent item={item} />
    </AnimatedList.Item>
  ))}
</AnimatedList>
```

### Collapse

Сворачивающийся контент.

```tsx
<Collapse isOpen={isOpen}>
  <div className="p-4">
    Скрытый контент
  </div>
</Collapse>
```

## Стилизация и темизация

### CSS классы

Все компоненты используют предопределенные CSS классы из Tailwind:

```css
/* Buttons */
.btn-primary { @apply bg-primary-600 hover:bg-primary-700 text-white; }
.btn-secondary { @apply bg-gray-200 hover:bg-gray-300 text-gray-900; }

/* Cards */
.card { @apply bg-white dark:bg-dark-800 rounded-xl shadow-sm border; }

/* Inputs */
.input { @apply border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500; }
```

### Темная тема

Все компоненты поддерживают темную тему через Tailwind dark: модификаторы:

```tsx
<div className="bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100">
  Контент, адаптирующийся к теме
</div>
```

### Кастомизация

Компоненты можно кастомизировать через props:

```tsx
<Button
  className="my-custom-button"
  style={{ borderRadius: '20px' }}
  variant="primary"
>
  Кастомная кнопка
</Button>
```

## Accessibility

Все компоненты включают accessibility функции:

- **Keyboard navigation** - полная поддержка клавиатуры
- **Screen readers** - ARIA атрибуты и семантическая разметка
- **Focus management** - правильное управление фокусом
- **Color contrast** - соответствие WCAG стандартам

## Тестирование компонентов

Примеры тестов для компонентов:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('shows loading state', () => {
    render(<Button loading>Submit</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

Данная библиотека компонентов обеспечивает консистентный и современный пользовательский интерфейс в стиле Replit, с полной поддержкой TypeScript, accessibility и темизации.
