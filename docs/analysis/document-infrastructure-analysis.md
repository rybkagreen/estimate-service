# Анализ инфраструктуры для работы с документами

## Резюме

Проект имеет хорошо развитую инфраструктуру для работы с документами, включающую frontend компоненты, backend сервисы, Redux состояние и базовую интеграцию с БД.

## 1. Frontend компоненты ✅

### Найденные компоненты:
- **FileUploader** (`apps/estimate-frontend/src/components/documents/FileUploader.tsx`)
  - Поддержка drag & drop
  - Выбор файлов через диалог
  - Базовая валидация по типу файла
  
- **DocumentViewer** (`apps/estimate-frontend/src/components/documents/DocumentViewer.tsx`)
  - Просмотр PDF файлов через iframe
  - Просмотр текстовых файлов
  - Базовая поддержка различных типов
  
- **DocumentEditor** (`apps/estimate-frontend/src/components/documents/DocumentEditor.tsx`)
  - Редактирование текстовых файлов
  - Сохранение изменений
  - Ограничен только текстовыми форматами

### DocumentsContainer
- Объединяет все компоненты
- Управляет состоянием документов
- Интеграция с Redux

## 2. Redux слайс ✅

### documentsSlice (`apps/estimate-frontend/src/store/slices/documentsSlice.ts`)
```typescript
interface DocumentFile {
  id: string;
  name: string;
  type: string;
  content?: string;
  file?: File;
  createdAt: string;
  updatedAt: string;
}
```

### Функциональность:
- Добавление/удаление документов
- Выбор активного документа
- Обновление содержимого
- Управление состоянием загрузки
- Обработка ошибок

## 3. Backend сервисы ✅

### FileUploadService (`services/estimate-service/src/modules/file-upload/`)
- **Загрузка файлов**: одиночная и множественная
- **Валидация**: размер, тип, опасные расширения
- **Хранение**: локальная файловая система
- **API endpoints**:
  - POST `/files/upload` - загрузка одного файла
  - POST `/files/upload/multiple` - множественная загрузка
  - POST `/files/upload/estimate-excel` - специальный endpoint для Excel смет
  - GET `/files/list` - список файлов
  - GET `/files/download/:filename` - скачивание
  - DELETE `/files/:id` - удаление

### FileDownloadService (`services/data-collector/src/services/file-download.service.ts`)
- Автоматическое скачивание файлов по URL
- Управление директорией загрузок
- Очистка старых файлов

### FileParserService (`services/data-collector/src/services/file-parser.service.ts`)
- Парсинг различных форматов:
  - Word (.doc, .docx) через mammoth
  - PDF через pdf-parse
  - CSV через csv-parser
  - Excel (.xls, .xlsx) через xlsx
- Извлечение структурированных данных

## 4. База данных ✅

### Модель Document в Prisma Schema:
```prisma
model Document {
  id          String         @id
  name        String
  description String?
  type        DocumentType   
  status      DocumentStatus
  
  // File details
  fileName String
  filePath String
  fileSize BigInt
  mimeType String
  checksum String?
  
  // Relations
  user       User
  project    Project?
  constructionObject ConstructionObject?
  
  // Version control
  version     String
  parentDoc   Document?
  versions    Document[]
  
  // AI processing
  aiProcessed Boolean
  aiMetadata  Json?
}
```

### Enum типы:
- DocumentType: CONTRACT, BLUEPRINT, SPECIFICATION, REPORT, etc.
- DocumentStatus: DRAFT, REVIEW, APPROVED, REJECTED, ARCHIVED

## 5. Уровень API интеграции ⚠️

### Сильные стороны:
- REST API endpoints настроены
- Swagger документация
- JWT авторизация
- Multer для обработки файлов

### Недостатки:
- **Отсутствует RTK Query слайс для документов**
- Frontend использует локальное состояние вместо API
- Нет интеграции между frontend fileService и backend API
- Отсутствует real-time синхронизация

## 6. Поддерживаемые типы документов

### Frontend:
- Excel (.xlsx) - полный парсинг через XLSX
- CSV - парсинг через Papa Parse
- PDF - только просмотр
- Текстовые файлы - просмотр и редактирование
- Планируется: .gge, .GSFX (форматы Гранд Смета)

### Backend:
- Изображения: JPEG, PNG, GIF
- Документы: PDF, Word, Excel, CSV
- Архивы: ZIP
- Текстовые файлы

## 7. Рекомендации по улучшению

### Критические:
1. **Создать documentApi.ts** с RTK Query для полной интеграции
2. **Синхронизировать** frontend компоненты с backend API
3. **Реализовать загрузку на сервер** вместо локального хранения

### Важные:
1. Добавить прогресс загрузки для больших файлов
2. Реализовать preview для изображений
3. Добавить версионирование документов
4. Интегрировать с AI для обработки документов

### Желательные:
1. Добавить поддержку форматов Гранд Смета
2. Реализовать OCR для сканов
3. Добавить электронную подпись
4. Создать шаблоны документов

## 8. Безопасность

### Реализовано:
- Валидация типов файлов
- Проверка размера
- Блокировка опасных расширений
- JWT авторизация

### Требуется:
- Антивирусная проверка
- Шифрование конфиденциальных документов
- Водяные знаки для PDF
- Логирование доступа к документам

## Заключение

Инфраструктура для работы с документами в проекте развита на **70%**. Основные компоненты созданы, но требуется доработка интеграции между frontend и backend, а также расширение функциональности для полноценной работы с документами в строительной отрасли.
