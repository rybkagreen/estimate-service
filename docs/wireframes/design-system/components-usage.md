# Руководство по использованию компонентов Design System

## Новые компоненты

### 1. Cards (Карточки)

Карточки используются для группировки связанного контента.

#### Базовая карточка
```html
<div class="card">
  <div class="card-header">
    <h3 class="card-title">Заголовок карточки</h3>
    <p class="card-subtitle">Подзаголовок</p>
  </div>
  <div class="card-body">
    Содержимое карточки
  </div>
  <div class="card-footer">
    Подвал карточки
  </div>
</div>
```

#### Метрическая карточка (для дашборда)
```html
<div class="metric-card">
  <div class="metric-card-icon">
    <svg><!-- иконка --></svg>
  </div>
  <div class="metric-card-value">1,234</div>
  <div class="metric-card-label">Активные сметы</div>
  <div class="metric-card-change metric-card-change-positive">
    <svg><!-- стрелка вверх --></svg>
    <span>+12.5%</span>
  </div>
</div>
```

#### Карточка со статусом
```html
<div class="status-card status-card-approved">
  <div class="card-body">
    <!-- Содержимое -->
  </div>
</div>
```

### 2. Notifications (Уведомления)

#### Алерты
```html
<!-- Информационный алерт -->
<div class="alert alert-info">
  <svg class="alert-icon"><!-- иконка --></svg>
  <div class="alert-content">
    <div class="alert-title">Информация</div>
    <div class="alert-message">Это информационное сообщение</div>
  </div>
  <button class="alert-close">×</button>
</div>

<!-- Алерт об успехе -->
<div class="alert alert-success">
  <svg class="alert-icon"><!-- иконка --></svg>
  <div class="alert-content">
    <div class="alert-message">Операция выполнена успешно!</div>
  </div>
</div>
```

#### Toast уведомления
```html
<!-- Контейнер для toast -->
<div class="toast-container toast-container-top-right">
  <div class="toast toast-entered">
    <div class="toast-with-icon">
      <svg class="toast-icon toast-icon-success"><!-- иконка --></svg>
      <div class="toast-content">
        <div class="toast-title">Успешно сохранено</div>
        <div class="toast-message">Смета была успешно обновлена</div>
      </div>
    </div>
    <button class="toast-close">×</button>
  </div>
</div>
```

#### Баннерные уведомления
```html
<div class="banner-notification banner-notification-warning">
  <div class="banner-notification-content">
    <svg class="w-5 h-5"><!-- иконка --></svg>
    <span>Система будет недоступна для обслуживания с 22:00 до 23:00</span>
  </div>
  <div class="banner-notification-actions">
    <a href="#" class="banner-notification-action">Подробнее</a>
    <button class="banner-notification-close">×</button>
  </div>
</div>
```

### 3. Navigation (Навигация)

#### Боковая панель (Sidebar)
```html
<aside class="sidebar">
  <div class="sidebar-header">
    <div class="sidebar-logo">
      <img src="logo.svg" alt="Logo" class="w-8 h-8">
      <span class="sidebar-logo-text">Estimate Service</span>
    </div>
    <button class="sidebar-toggle">
      <svg><!-- иконка --></svg>
    </button>
  </div>
  
  <div class="sidebar-content">
    <nav class="sidebar-nav">
      <div class="sidebar-section">
        <h3 class="sidebar-section-title">Основное</h3>
        <a href="/" class="sidebar-nav-link sidebar-nav-link-active">
          <svg class="sidebar-nav-icon"><!-- иконка --></svg>
          <span class="sidebar-nav-text">Дашборд</span>
          <span class="sidebar-nav-badge badge badge-primary">3</span>
        </a>
        <a href="/estimates" class="sidebar-nav-link">
          <svg class="sidebar-nav-icon"><!-- иконка --></svg>
          <span class="sidebar-nav-text">Сметы</span>
        </a>
      </div>
    </nav>
  </div>
  
  <div class="sidebar-footer">
    <!-- Подвал сайдбара -->
  </div>
</aside>
```

#### Мобильная навигация
```html
<nav class="mobile-nav">
  <div class="mobile-nav-list">
    <a href="/" class="mobile-nav-link mobile-nav-link-active">
      <svg class="mobile-nav-icon"><!-- иконка --></svg>
      <span class="mobile-nav-text">Главная</span>
    </a>
    <a href="/estimates" class="mobile-nav-link">
      <svg class="mobile-nav-icon"><!-- иконка --></svg>
      <span class="mobile-nav-text">Сметы</span>
    </a>
    <!-- другие пункты -->
  </div>
</nav>
```

#### Вкладки (Tabs)
```html
<div class="tabs">
  <div class="tabs-list">
    <button class="tab tab-active">
      <svg class="tab-icon"><!-- иконка --></svg>
      Общие данные
    </button>
    <button class="tab">Позиции сметы</button>
    <button class="tab">История изменений</button>
  </div>
</div>
```

#### Хлебные крошки
```html
<nav class="breadcrumb">
  <div class="breadcrumb-item">
    <a href="/" class="breadcrumb-link">Главная</a>
    <span class="breadcrumb-separator">/</span>
  </div>
  <div class="breadcrumb-item">
    <a href="/projects" class="breadcrumb-link">Проекты</a>
    <span class="breadcrumb-separator">/</span>
  </div>
  <div class="breadcrumb-item">
    <span class="breadcrumb-current">Проект №123</span>
  </div>
</nav>
```

### 4. Badges (Бейджи и метки)

#### Бейджи статусов
```html
<!-- Статусы смет -->
<span class="badge badge-draft">Черновик</span>
<span class="badge badge-pending">На рассмотрении</span>
<span class="badge badge-approved">Утверждена</span>
<span class="badge badge-rejected">Отклонена</span>

<!-- С иконкой -->
<span class="status-badge badge-approved">
  <span class="status-badge-dot bg-green-500"></span>
  Активна
</span>
```

#### Бейджи ролей
```html
<span class="badge badge-admin">Администратор</span>
<span class="badge badge-manager">Руководитель</span>
<span class="badge badge-estimator">Сметчик</span>
<span class="badge badge-viewer">Наблюдатель</span>
```

#### Теги
```html
<!-- Простой тег -->
<span class="tag">Строительство</span>

<!-- Удаляемый тег -->
<span class="tag tag-removable">
  Ремонт
  <button class="tag-remove">
    <svg class="tag-remove-icon"><!-- иконка X --></svg>
  </button>
</span>

<!-- Группа тегов -->
<div class="tag-group">
  <span class="tag">React</span>
  <span class="tag">TypeScript</span>
  <span class="tag">Tailwind</span>
</div>
```

#### Счетчики
```html
<!-- Счетчик уведомлений -->
<span class="count-badge count-badge-error">5</span>

<!-- Плавающий бейдж -->
<div class="relative">
  <button class="btn">
    <svg><!-- иконка уведомлений --></svg>
  </button>
  <span class="floating-badge">3</span>
</div>
```

### 5. Loading States (Состояния загрузки)

#### Спиннеры
```html
<!-- Разные размеры -->
<svg class="spinner spinner-sm"><!-- SVG спиннер --></svg>
<svg class="spinner spinner-md spinner-primary"><!-- SVG спиннер --></svg>
<svg class="spinner spinner-lg spinner-white"><!-- SVG спиннер --></svg>

<!-- Загрузка кнопки -->
<button class="btn btn-primary btn-loading">
  <svg class="btn-loading-spinner spinner spinner-sm spinner-white">
    <!-- SVG спиннер -->
  </svg>
  <span class="btn-loading-text">Сохранить</span>
</button>
```

#### Скелетоны
```html
<!-- Скелетон карточки -->
<div class="skeleton-card-item">
  <div class="skeleton-card-header">
    <div class="skeleton-avatar"></div>
    <div class="flex-1 space-y-2">
      <div class="skeleton-text w-32"></div>
      <div class="skeleton-text-sm w-24"></div>
    </div>
  </div>
  <div class="skeleton-card-body">
    <div class="skeleton-lines">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>
  </div>
</div>

<!-- Скелетон таблицы -->
<div class="skeleton-table">
  <div class="skeleton-table-row">
    <div class="skeleton-table-cell w-1/4"></div>
    <div class="skeleton-table-cell w-1/3"></div>
    <div class="skeleton-table-cell w-1/4"></div>
    <div class="skeleton-table-cell w-1/6"></div>
  </div>
</div>
```

#### Оверлей загрузки
```html
<div class="relative">
  <!-- Контент -->
  <div class="loading-overlay">
    <div class="loading-overlay-content">
      <svg class="spinner spinner-lg spinner-primary">
        <!-- SVG спиннер -->
      </svg>
      <p class="loading-overlay-text">Загрузка данных...</p>
    </div>
  </div>
</div>
```

## Рекомендации по использованию

### 1. Адаптивность
Все компоненты оптимизированы для мобильных устройств. Используйте:
- `mobile-nav` для мобильной навигации
- Адаптивные классы сетки для карточек
- Компактные варианты для маленьких экранов

### 2. Темная тема
Все компоненты поддерживают темную тему через классы Tailwind с префиксом `dark:`.

### 3. Доступность
- Всегда добавляйте `aria-label` для иконок-кнопок
- Используйте семантические HTML-теги
- Обеспечивайте достаточный цветовой контраст

### 4. Анимации
- Компоненты имеют плавные переходы
- Для отключения анимаций используйте `prefers-reduced-motion`

### 5. Композиция
Компоненты можно комбинировать:
```html
<!-- Карточка с бейджем и состоянием загрузки -->
<div class="card relative">
  <div class="ribbon">Новое</div>
  <div class="card-header">
    <h3 class="card-title">Смета №123</h3>
    <span class="badge badge-pending">На рассмотрении</span>
  </div>
  <div class="card-body">
    <!-- контент -->
  </div>
  <div class="loading-overlay">
    <svg class="spinner spinner-md"><!-- спиннер --></svg>
  </div>
</div>
```
