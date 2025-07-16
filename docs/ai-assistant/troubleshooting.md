# 🆘 Руководство по устранению неполадок

## Обзор

Это руководство поможет решить типичные проблемы при работе с ИИ-ассистентом Estimate Service. Документ организован по категориям проблем для быстрого поиска решений.

## 🔍 Быстрая диагностика

### Проверочный чек-лист

```bash
# 1. Проверка статуса сервисов
curl -X GET http://localhost:3001/health

# 2. Проверка подключения к DeepSeek
curl -X POST http://localhost:3001/api/v1/ai-assistant/health-check \
  -H "Authorization: Bearer $TOKEN"

# 3. Проверка базы данных
npm run db:check

# 4. Проверка векторной БД
curl http://localhost:8080/v1/.well-known/ready
```

## 💬 Проблемы с чатом

### Проблема: Чат не отвечает на сообщения

**Симптомы:**
- Сообщения отправляются, но ответ не приходит
- Индикатор загрузки крутится бесконечно
- Нет ошибок в консоли браузера

**Решения:**

1. **Проверьте WebSocket соединение:**
```javascript
// В консоли браузера
const socket = window.__chatSocket;
console.log('Socket connected:', socket?.connected);
console.log('Socket ID:', socket?.id);
```

2. **Проверьте статус API:**
```bash
curl -X GET http://localhost:3001/api/v1/ai-assistant/status \
  -H "Authorization: Bearer $TOKEN"
```

3. **Проверьте логи сервера:**
```bash
# Backend логи
docker logs estimate-service-backend -f --tail 100

# Фильтрация по ошибкам
docker logs estimate-service-backend 2>&1 | grep ERROR
```

4. **Перезапустите WebSocket соединение:**
```javascript
// Frontend код
if (socket) {
  socket.disconnect();
  socket.connect();
}
```

### Проблема: Ошибка "DeepSeek API недоступен"

**Симптомы:**
- Сообщение об ошибке: "Failed to connect to DeepSeek API"
- HTTP статус 503

**Решения:**

1. **Проверьте API ключ:**
```bash
# Убедитесь, что ключ установлен
echo $DEEPSEEK_API_KEY

# Проверьте валидность ключа
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-r1-2024",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

2. **Проверьте лимиты API:**
```typescript
// services/deepseek.service.ts
// Добавьте логирование заголовков ответа
console.log('Rate limit remaining:', response.headers['x-ratelimit-remaining']);
console.log('Rate limit reset:', new Date(response.headers['x-ratelimit-reset'] * 1000));
```

3. **Используйте резервный режим:**
```env
# .env
DEEPSEEK_MOCK_MODE=true
```

### Проблема: Медленные ответы от ИИ

**Симптомы:**
- Ответы приходят через 30+ секунд
- Таймауты соединения

**Решения:**

1. **Оптимизируйте размер контекста:**
```typescript
// Ограничьте историю сообщений
const MAX_HISTORY_MESSAGES = 10;
const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
```

2. **Используйте стриминг ответов:**
```typescript
// Включите streaming в настройках
const response = await deepSeekService.chat(messages, {
  stream: true,
  onChunk: (chunk) => {
    // Обработка частичного ответа
    updateUIWithChunk(chunk);
  }
});
```

3. **Настройте кэширование:**
```typescript
// Redis кэш для частых запросов
const cacheKey = generateCacheKey(message);
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

## 📊 Проблемы с анализом смет

### Проблема: Ошибка парсинга файла сметы

**Симптомы:**
- "Unsupported file format"
- "Failed to parse estimate file"

**Решения:**

1. **Проверьте формат файла:**
```typescript
// Поддерживаемые форматы
const SUPPORTED_FORMATS = [
  '.xlsx', '.xls',  // Excel
  '.xml',           // АРПС 1.10
  '.gsp',           // Гранд-Смета
  '.csv',           // CSV
  '.pdf'            // PDF (ограниченно)
];
```

2. **Валидация файла перед загрузкой:**
```javascript
// Frontend валидация
function validateFile(file) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    throw new Error('Файл слишком большой (макс. 10MB)');
  }
  
  const ext = file.name.split('.').pop().toLowerCase();
  if (!SUPPORTED_FORMATS.includes(`.${ext}`)) {
    throw new Error(`Формат .${ext} не поддерживается`);
  }
}
```

3. **Ручное указание формата:**
```typescript
// При загрузке укажите формат явно
const formData = new FormData();
formData.append('file', file);
formData.append('format', 'grand_smeta'); // или 'arps_110'
```

### Проблема: Неверные результаты анализа

**Симптомы:**
- Завышенные/заниженные оценки экономии
- Неправильные коды ФСБЦ
- Отсутствующие проверки

**Решения:**

1. **Обновите базу ФСБЦ:**
```bash
# Запустите обновление данных
npm run fsbc:update

# Проверьте актуальность
npm run fsbc:check-version
```

2. **Настройте региональные коэффициенты:**
```typescript
// config/regional-coefficients.ts
export const regionalCoefficients = {
  'Moscow': {
    labor: 1.2,
    materials: 1.15,
    equipment: 1.1
  },
  // Добавьте свой регион
};
```

3. **Калибровка анализатора:**
```bash
# Запустите калибровку на эталонных сметах
npm run analyzer:calibrate --samples=./test-estimates/
```

## 🔍 Проблемы с поиском

### Проблема: Поиск не находит расценки

**Симптомы:**
- Пустые результаты поиска
- "No rates found"

**Решения:**

1. **Переиндексируйте векторную БД:**
```bash
# Полная переиндексация
npm run weaviate:reindex

# Проверка индекса
npm run weaviate:stats
```

2. **Используйте альтернативные запросы:**
```typescript
// Попробуйте синонимы
const synonyms = {
  'штукатурка': ['оштукатуривание', 'штукатурные работы'],
  'кирпич': ['кладка', 'кирпичная кладка'],
  // ...
};
```

3. **Расширенный поиск:**
```typescript
// Включите fuzzy matching
const results = await searchRates(query, {
  fuzzy: true,
  fuzziness: 2,
  includePartialMatches: true
});
```

## 🛡️ Проблемы безопасности

### Проблема: Ошибка аутентификации

**Симптомы:**
- 401 Unauthorized
- "Invalid token"

**Решения:**

1. **Проверьте срок действия токена:**
```javascript
// Декодируйте JWT
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expires:', new Date(payload.exp * 1000));
```

2. **Обновите токен:**
```javascript
async function refreshToken() {
  const response = await fetch('/api/v1/auth/refresh', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      refresh_token: localStorage.getItem('refresh_token')
    })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
}
```

### Проблема: CORS ошибки

**Симптомы:**
- "Access to fetch at ... from origin ... has been blocked by CORS policy"

**Решения:**

1. **Настройте CORS на сервере:**
```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

2. **Используйте прокси в разработке:**
```json
// frontend package.json
{
  "proxy": "http://localhost:3001"
}
```

## 🚀 Проблемы производительности

### Проблема: Высокое потребление памяти

**Симптомы:**
- Замедление работы
- Out of memory errors

**Решения:**

1. **Ограничьте размер кэша:**
```typescript
// cache.config.ts
export const cacheConfig = {
  max: 1000, // максимум элементов
  ttl: 3600, // время жизни в секундах
  updateAgeOnGet: false,
  dispose: (key, value) => {
    // Очистка при удалении
  }
};
```

2. **Оптимизируйте запросы к БД:**
```typescript
// Используйте пагинацию
const messages = await prisma.chatMessage.findMany({
  where: { sessionId },
  take: 50,
  skip: offset,
  orderBy: { createdAt: 'desc' }
});
```

3. **Мониторинг памяти:**
```bash
# Проверка использования памяти
docker stats estimate-service-backend

# Heap snapshot для анализа
node --inspect=0.0.0.0:9229 dist/main.js
```

## 📱 Проблемы мобильной версии

### Проблема: Интерфейс не адаптирован

**Решения:**

1. **Проверьте viewport:**
```html
<!-- index.html -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

2. **Используйте touch события:**
```javascript
// Поддержка свайпов
import { useSwipeable } from 'react-swipeable';

const handlers = useSwipeable({
  onSwipedLeft: () => navigateNext(),
  onSwipedRight: () => navigateBack(),
});
```

## 🔧 Инструменты диагностики

### 1. Встроенная диагностика

```bash
# Полная диагностика системы
npm run diagnostics

# Проверка конкретного компонента
npm run diagnostics -- --component=ai-assistant
```

### 2. Логирование

```typescript
// Включите debug режим
// .env
LOG_LEVEL=debug
DEEPSEEK_DEBUG=true

// Просмотр логов
tail -f logs/ai-assistant.log | grep ERROR
```

### 3. Метрики производительности

```bash
# Prometheus метрики
curl http://localhost:3001/metrics

# Grafana дашборд
open http://localhost:3000/d/ai-assistant/overview
```

## 📞 Получение помощи

### 1. Сбор информации для поддержки

```bash
# Генерация отчета о проблеме
npm run generate-support-report

# Отчет будет сохранен в ./support-report-{timestamp}.zip
```

### 2. Контакты поддержки

- **Техническая поддержка**: support@estimate-service.ru
- **Критические проблемы**: +7 (800) 123-45-67
- **GitHub Issues**: https://github.com/estimate-service/issues

### 3. Часто обновляемые ресурсы

- [Status Page](https://status.estimate-service.ru)
- [Known Issues](https://github.com/estimate-service/issues?q=label:known-issue)
- [Community Forum](https://forum.estimate-service.ru)

---

**Версия**: 1.0  
**Обновлено**: 15.07.2025  
**Следующее обновление**: При выходе новой версии
