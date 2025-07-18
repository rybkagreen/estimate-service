# Dashboard Wireframe

## Обновленная главная страница

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [≡] Estimate Service           [🔍 Поиск...]        [🔔] [🌙] [👤 Профиль ▼]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Добро пожаловать, Иван!                                    12 января 2025 │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                             │
│  ┌─── Быстрые действия ───┐  ┌─── Статистика за месяц ─────────────────┐  │
│  │                         │  │                                         │  │
│  │ [+ Новая смета]        │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
│  │ [📁 Открыть проект]    │  │  │   12    │ │   8     │ │  2.1M   │  │  │
│  │ [📊 Создать отчет]     │  │  │ Проекты │ │  Сметы  │ │ Экономия│  │  │
│  │ [🤖 AI Ассистент]      │  │  └─────────┘ └─────────┘ └─────────┘  │  │
│  └────────────────────────┘  │                                         │  │
│                               │  📈 График выполнения:                  │  │
│  ┌─── Последние сметы ────┐  │  ┌─────────────────────────────────┐  │  │
│  │                         │  │  │     ╱╲    ╱╲                   │  │  │
│  │ 📄 СМ-2025-001         │  │  │    ╱  ╲  ╱  ╲                  │  │  │
│  │    Офисный ремонт      │  │  │   ╱    ╲╱    ╲                 │  │  │
│  │    ⏰ 2 часа назад     │  │  │  ╱            ╲                │  │  │
│  │    ✅ Завершена        │  │  └─────────────────────────────────┘  │  │
│  │ ─────────────────────  │  └────────────────────────────────────────┘  │
│  │ 📄 СМ-2025-002         │                                              │
│  │    Строительство склада │  ┌─── Уведомления ───────────────────────┐  │
│  │    ⏰ Вчера            │  │                                         │  │
│  │    🔄 В работе         │  │ ⚠️ Обновление индексов ФЕР за Q1 2025  │  │
│  │ ─────────────────────  │  │ 📢 Новая версия нормативов ГЭСН        │  │
│  │ 📄 СМ-2024-158         │  │ ✅ Смета СМ-2025-001 согласована       │  │
│  │    Дорожные работы     │  │ 🔔 Напоминание: отчет КС-2 до 15.01    │  │
│  │    ⏰ 3 дня назад      │  │                                         │  │
│  │    📝 Черновик         │  │ [Все уведомления →]                     │  │
│  │                         │  └────────────────────────────────────────┘  │
│  │ [Все сметы →]           │                                              │
│  └────────────────────────┘                                              │
│                                                                             │
│  ┌─── AI Insights ────────────────────────────────────────────────────┐  │
│  │ 💡 Рекомендации на основе ваших данных:                           │  │
│  │                                                                     │  │
│  │ • Оптимизация сметы СМ-2025-002 может сэкономить до 150,000 ₽    │  │
│  │ • Обнаружены устаревшие расценки в 3 сметах - требуется обновление│  │
│  │ • Прогноз завершения проекта "Офисный ремонт" - на 2 дня раньше  │  │
│  │                                                                     │  │
│  │ [Подробный анализ →]                                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Компоненты Dashboard

### 1. Быстрые действия
- Крупные кнопки для основных операций
- Иконки для визуальной идентификации
- Доступ в один клик

### 2. Статистика
- Ключевые метрики
- Визуализация трендов
- Интерактивные графики

### 3. Последние сметы
- Список с preview информацией
- Статусы и временные метки
- Быстрый доступ к документам

### 4. Уведомления
- Приоритезированный список
- Цветовое кодирование по важности
- Действия прямо из уведомления

### 5. AI Insights
- Персонализированные рекомендации
- Проактивные предупреждения
- Аналитика на основе данных

## Расширенный вид Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [≡] Estimate Service        Панель управления       [🔍] [🔔 3] [⚙️] [👤 ▼]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── Ключевые метрики ──────────────────────────────────────────────────┐  │
│  │                                                                        │  │
│  │  ┌──────────────┬──────────────┬──────────────┬──────────────────┐  │  │
│  │  │ 📊 Активные  │ 💰 Общая     │ 📈 Рост      │ ⏰ Среднее       │  │  │
│  │  │    проекты   │    сумма     │    месяц     │    время        │  │  │
│  │  │              │              │              │                  │  │  │
│  │  │      12      │   ₽45.7M     │   +23.5%     │    3.2 дня      │  │  │
│  │  │              │              │              │                  │  │  │
│  │  │  ↑ 2 к пред. │  ↑ ₽5.3M     │  ↑ 8.2%      │  ↓ 0.5 дней     │  │  │
│  │  └──────────────┴──────────────┴──────────────┴──────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── Активность по проектам ───┐  ┌─── Распределение по статусам ─────┐  │
│  │                               │  │                                    │  │
│  │  Проект        Сметы  Сумма  │  │     Черновики    15%               │  │
│  │  ─────────────────────────── │  │     В работе     45%  ████████    │  │
│  │  Офис-2025      3    ₽2.1M   │  │     На проверке  25%  █████       │  │
│  │  Склад А        5    ₽8.5M   │  │     Завершено    15%  ███         │  │
│  │  Дорога М4      2    ₽15.3M  │  │                                    │  │
│  │  ЖК Парковый    8    ₽12.4M  │  │  Всего смет: 125                  │  │
│  │  Школа №15      4    ₽7.4M   │  │                                    │  │
│  │                               │  └────────────────────────────────────┘  │
│  │  [Все проекты →]              │                                           │
│  └───────────────────────────────┘  ┌─── График загрузки команды ────────┐  │
│                                     │                                    │  │
│  ┌─── Календарь задач ──────────┐  │  Иван И.     ████████░░  80%     │  │
│  │                               │  │  Мария П.    ██████░░░░  60%     │  │
│  │  Пн  Вт  Ср  Чт  Пт  Сб  Вс  │  │  Петр С.     █████████░  90%     │  │
│  │  ──  ──  ──  ──  ──  ──  ──  │  │  Анна К.     ███░░░░░░░  30%     │  │
│  │   9  10  11 (12) 13  14  15  │  │  Олег Д.     ███████░░░  70%     │  │
│  │   •   ••  •   ⚡  •           │  │                                    │  │
│  │  16  17  18  19  20  21  22  │  │  Средняя загрузка: 66%            │  │
│  │   •       ••  •               │  └────────────────────────────────────┘  │
│  │  23  24  25  26  27  28  29  │                                           │
│  │       •   •   ••              │  ┌─── Финансовая аналитика ──────────┐  │
│  │                               │  │                                    │  │
│  │  • Сметы  •• Дедлайны         │  │  План/Факт за январь:             │  │
│  │  ⚡ Сегодня                    │  │  ┌────────────────────────────┐   │  │
│  └───────────────────────────────┘  │  │        План ████████       │   │  │
│                                     │  │        Факт ██████         │   │  │
│                                     │  │             0   25M  50M   │   │  │
│                                     │  └────────────────────────────┘   │  │
│                                     │                                    │  │
│                                     │  Экономия: ₽2.1M (8.4%)          │  │
│                                     └────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Мобильная версия Dashboard

```
┌─────────────────────┐
│ ≡  Estimate Service │
├─────────────────────┤
│                     │
│ Привет, Иван! 👋    │
│                     │
│ ┌─────────────────┐ │
│ │ Активные сметы  │ │
│ │       8         │ │
│ │    ↑ 2 новых    │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Сумма за месяц  │ │
│ │    ₽12.5M       │ │
│ │   ↑ 15% роста   │ │
│ └─────────────────┘ │
│                     │
│ 📊 Последние сметы  │
│ ───────────────     │
│ • СМ-2025-001      │
│   Офисный ремонт    │
│   ⏰ 2 часа назад   │
│                     │
│ • СМ-2025-002      │
│   Склад А          │
│   ⏰ Вчера          │
│                     │
│ [Все сметы →]       │
│                     │
│ 🔔 Уведомления      │
│ ───────────────     │
│ ⚠️ Обновление ФЕР   │
│ ✅ Смета одобрена   │
│                     │
│ ┌─────────────────┐ │
│ │ [+ Новая смета] │ │
│ └─────────────────┘ │
│                     │
└─────────────────────┘
```

## Виджеты Dashboard

### Виджет прогресса проекта
```
┌─── Прогресс: Офисный комплекс ─────┐
│                                     │
│  Завершено: 65%                    │
│  ████████████░░░░░░                │
│                                     │
│  Смет: 12/18   Сумма: ₽8.5M/₽13M  │
│  Дедлайн: 25 дней                  │
│                                     │
│  Риски: ⚠️ Задержка поставок       │
│                                     │
│  [Открыть проект →]                │
└─────────────────────────────────────┘
```

### Виджет производительности
```
┌─── Производительность за неделю ────┐
│                                     │
│  Создано смет: 23  ↑ 35%           │
│  Согласовано: 18   ↑ 20%           │
│  Отклонено: 2      ↓ 50%           │
│                                     │
│  График активности:                 │
│  Пн ██████                         │
│  Вт ████████                       │
│  Ср ███████████                    │
│  Чт ████████                       │
│  Пт ██████                         │
│                                     │
│  Лучший день: Среда                │
└─────────────────────────────────────┘
```

### Виджет напоминаний
```
┌─── Важные напоминания ──────────────┐
│                                     │
│  📅 Сегодня:                       │
│  • 10:00 - Проверка сметы СМ-001   │
│  • 14:00 - Встреча по проекту А    │
│                                     │
│  📅 Завтра:                        │
│  • Дедлайн по смете СМ-2025-003    │
│  • Обновление индексов ФЕР         │
│                                     │
│  ⚠️ Просрочено: 2 задачи           │
│                                     │
│  [Календарь →] [Добавить →]        │
└─────────────────────────────────────┘
```

## Настройки Dashboard

```
┌─── Настройка панели управления ─────────────────────────────────────────────┐
│                                                                              │
│  Выберите виджеты для отображения:                                          │
│                                                                              │
│  ☑ Ключевые метрики              Расположение: [Сверху ▼]                   │
│  ☑ Последние сметы               Размер: [Средний ▼]                        │
│  ☑ Статистика                    Обновление: [Каждые 5 мин ▼]               │
│  ☑ Уведомления                                                               │
│  ☑ AI рекомендации                                                           │
│  ☐ Календарь задач                                                           │
│  ☑ График загрузки                                                           │
│  ☐ Финансовая аналитика                                                      │
│  ☑ Быстрые действия                                                          │
│                                                                              │
│  Тема оформления:                                                            │
│  ○ Светлая  ● Темная  ○ Системная                                           │
│                                                                              │
│  Период по умолчанию:                                                        │
│  ○ День  ○ Неделя  ● Месяц  ○ Квартал                                      │
│                                                                              │
│  [Сохранить настройки] [Сбросить] [Отмена]                                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```
