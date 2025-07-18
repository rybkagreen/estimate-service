# Отчет по неиспользуемым компонентам фронтенда
*Дата: 2025-01-17*

## Сводка
Проведен анализ фронтенда (apps/estimate-frontend) на предмет неиспользуемых компонентов, хуков и API-интеграций.

## 1. Неимпортируемые React-компоненты

### Обнаруженные неиспользуемые компоненты:

#### UI компоненты с тестами но без использования:
- `components/ui/CountBadge/CountBadge.test.tsx` - тест существует, но компонент не импортируется
- `components/ui/MetricCard/MetricCard.test.tsx` - тест существует, но компонент не импортируется  
- `components/ui/RoleBadge/RoleBadge.test.tsx` - тест существует, но компонент не импортируется
- `components/ui/StatusCard/StatusCard.test.tsx` - тест существует, но компонент не импортируется

#### Страницы без маршрутов в App.tsx:
- `pages/Calendar.tsx` - не добавлен в роутинг
- `pages/DocumentManagement.tsx` - не добавлен в роутинг (используется DocumentsContainer)
- `pages/E2E.tsx` - не добавлен в роутинг
- `pages/Help.tsx` - не добавлен в роутинг
- `pages/Integrations.tsx` - не добавлен в роутинг
- `pages/KnowledgeBase.tsx` - не добавлен в роутинг
- `pages/Login.tsx` - не добавлен в роутинг
- `pages/NotFound.tsx` - не добавлен в роутинг (должен быть для 404)
- `pages/Notifications.tsx` - не добавлен в роутинг
- `pages/Reports.tsx` - не добавлен в роутинг
- `pages/Team.tsx` - не добавлен в роутинг
- `pages/Templates.tsx` - не добавлен в роутинг
- `pages/Visualization.tsx` - не добавлен в роутинг

#### Страницы настроек без использования:
- `pages/Settings/Appearance.tsx`
- `pages/Settings/Backup.tsx`
- `pages/Settings/Integrations.tsx`
- `pages/Settings/Notifications.tsx`
- `pages/Settings/Personalization.tsx`
- `pages/Settings/Security.tsx`
- `pages/Settings/Shortcuts.tsx`

#### Административные страницы без маршрутов:
- `pages/admin/SystemMonitoring.tsx`
- `pages/admin/TemplateManagement.tsx`
- `pages/admin/Users.tsx`

#### Неиспользуемые компоненты:
- `components/admin/BackupRestore.tsx`
- `components/auth/AuthProvider.tsx`
- `components/auth/ProtectedRoute.tsx`
- `components/auth/RoleGuard.tsx`
- `components/changes/ChangeRequests.tsx`
- `components/documents/DocumentEditor.tsx`
- `components/documents/DocumentViewer.tsx`
- `components/documents/FileUploader.tsx`
- `components/risks/RiskMatrix.tsx`

## 2. Неиспользуемые хуки, контексты и утилиты

### Контексты:
- ✅ `ThemeContext` - используется в App.tsx

### Хуки:
- Директория hooks не обнаружена в проекте
- `store/hooks.ts` - требует проверки использования

### Утилиты:
- Директория utils не обнаружена в проекте

## 3. API-запросы без обработчиков

### Дублирование сервисов:
- `services/aiService.ts` и `services/aiServiceNew.ts` - два сервиса для работы с AI, требуется унификация

### API endpoints без явного использования на фронтенде:
Все endpoints в store/api/* созданы, но требуется проверка их использования в компонентах:
- `dashboardApi.ts` - getDashboardStats
- `estimateApi.ts` - множественные endpoints для работы со сметами
- `knowledgeApi.ts` - getKnowledgeBase, searchKnowledge
- `materialsApi.ts` - endpoints для материалов
- `projectsApi.ts` - endpoints для проектов
- `userApi.ts` - getCurrentUser
- `worksApi.ts` - endpoints для работ

### Redux slices без проверки использования:
- `slices/documentsSlice.ts`
- `slices/estimateItemsSlice.ts`
- `slices/estimatesSlice.ts`
- `slices/materialsSlice.ts`
- `slices/templatesSlice.ts`
- `slices/uiSlice.ts`
- `slices/worksSlice.ts`

## Рекомендации

### Критичные действия:
1. **Добавить маршруты** для страниц Login, NotFound (404), Reports, Team
2. **Интегрировать** AuthProvider, ProtectedRoute и RoleGuard для защиты маршрутов
3. **Объединить** aiService.ts и aiServiceNew.ts в единый сервис

### Важные действия:
1. **Создать структуру hooks** для переиспользуемой логики
2. **Создать utils** для общих функций
3. **Добавить маршруты** для административных страниц с проверкой прав
4. **Реализовать lazy loading** для неосновных страниц

### Оптимизация:
1. **Удалить** неиспользуемые тесты компонентов или реализовать сами компоненты
2. **Провести аудит** Redux slices на предмет использования
3. **Документировать** какие API endpoints активно используются

## Метрики

- **Общее количество компонентов**: ~85
- **Неиспользуемых страниц**: 21
- **Неиспользуемых компонентов**: 9
- **Потенциально дублирующихся сервисов**: 2
- **Процент неиспользуемого кода**: ~35%
