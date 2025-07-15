# Настройка API ключей и внешних интеграций

## Обзор

Этот документ описывает процесс настройки API ключей для всех внешних сервисов,
используемых в проекте Estimate Service.

## Требуемые API ключи

### 1. DeepSeek API

DeepSeek - основная AI модель для генерации смет и анализа документов.

**Получение ключа:**

1. Зарегистрируйтесь на [platform.deepseek.com](https://platform.deepseek.com)
2. Перейдите в раздел API Keys
3. Создайте новый ключ
4. Скопируйте ключ в формате `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

**Настройка в .env:**

```env
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MAX_TOKENS=4000
DEEPSEEK_TEMPERATURE=0.3
```

**Ограничения:**

- Бесплатный тариф: 1500 запросов/день, 300 токенов/минуту
- Платные тарифы недоступны из России (требуется VPN + зарубежная карта)

### 2. Hugging Face API

Используется для дополнительных AI моделей и обработки текста.

**Получение ключа:**

1. Зарегистрируйтесь на [huggingface.co](https://huggingface.co)
2. Перейдите в Settings → Access Tokens
3. Создайте новый токен с правами "read"
4. Скопируйте токен в формате `hf_xxxxxxxxxxxxxxxxxxxxxxxx`

**Настройка в .env:**

```env
HUGGINGFACE_API_KEY=hf_your_api_key_here
HF_TOKEN=hf_your_api_key_here
HUGGINGFACE_PROVIDER=novita
HUGGINGFACE_MODEL_NAME=deepseek/deepseek-r1-turbo
HUGGINGFACE_MAX_TOKENS=2048
HUGGINGFACE_TEMPERATURE=0.7
```

### 3. ФСБЦ API

Федеральная сборная база ценников - официальная база расценок для строительства.

**Получение доступа:**

1. Обратитесь в техподдержку ФСБЦ по email: support@fsbc.ru
2. Заполните заявку на получение API доступа
3. Дождитесь одобрения (обычно 3-5 рабочих дней)
4. Получите API ключ и секрет

**Настройка в .env:**

```env
FSBC_API_URL=https://api.fsbc.ru/v2
FSBC_API_KEY=your_fsbc_api_key_here
FSBC_API_SECRET=your_fsbc_api_secret_here
FSBC_REGION_CODE=77  # Код региона (77 - Москва)
FSBC_PRICE_LEVEL=current  # current или base
FSBC_CACHE_TTL=86400  # Время кеширования в секундах
```

**Коды регионов:**

- 77 - Москва
- 78 - Санкт-Петербург
- 50 - Московская область
- 47 - Ленинградская область
- И другие согласно ОКАТО

### 4. Гранд Смета API

Интеграция с популярной системой сметного расчета.

**Получение доступа:**

1. Свяжитесь с поддержкой Гранд Смета
2. Запросите API доступ для интеграции
3. Получите API ключ и документацию

**Настройка в .env:**

```env
GRAND_SMETA_API_URL=https://api.grandsmeta.ru
GRAND_SMETA_API_KEY=your_grand_smeta_api_key_here
```

### 5. MCP Server Configuration

Model Context Protocol сервер для расширенной интеграции с AI.

**Настройка в .env:**

```env
# Основные настройки
MCP_SERVER_PORT=3333
MCP_SERVER_HOST=localhost
MCP_SERVER_NAME=estimate-service-mcp
MCP_SERVER_VERSION=1.0.0

# Аутентификация (опционально)
MCP_AUTH_ENABLED=false
MCP_AUTH_TOKEN=your_mcp_auth_token_here

# Настройки инструментов
MCP_TOOLS_ENABLED=true
MCP_TOOLS_TIMEOUT=30000
MCP_TOOLS_MAX_RETRIES=3

# Настройки ресурсов
MCP_RESOURCES_ENABLED=true
MCP_RESOURCES_BASE_PATH=/workspaces/estimate-service
MCP_RESOURCES_ALLOWED_EXTENSIONS=.ts,.js,.json,.md,.txt,.yaml,.yml

# Логирование
MCP_LOG_LEVEL=info
MCP_LOG_FORMAT=json
MCP_LOG_FILE=./logs/mcp-server.log
```

## Проверка настроек

### 1. Проверка переменных окружения

```bash
# Проверка загрузки переменных
npm run check:env

# Или вручную
node -e "console.log(process.env.DEEPSEEK_API_KEY ? 'DeepSeek API key loaded' : 'DeepSeek API key missing')"
```

### 2. Тестирование подключений

```bash
# Тест DeepSeek API
npm run test:deepseek

# Тест Hugging Face API
npm run test:huggingface

# Тест ФСБЦ API
npm run test:fsbc

# Тест всех интеграций
npm run test:integrations
```

### 3. MCP Server проверка

```bash
# Запуск MCP сервера
cd mcp-server
npm run dev

# Проверка статуса
curl http://localhost:3333/health
```

## Безопасность

### Важные правила:

1. **Никогда не коммитьте .env файл в Git**

   ```bash
   # Убедитесь что .env в .gitignore
   echo ".env" >> .gitignore
   ```

2. **Используйте разные ключи для разных окружений**
   - Development: `.env.development`
   - Staging: `.env.staging`
   - Production: `.env.production`

3. **Ротация ключей**
   - Меняйте API ключи каждые 90 дней
   - Используйте систему управления секретами в production

4. **Ограничение доступа**
   - Ограничьте IP адреса для API ключей где возможно
   - Используйте минимальные необходимые права доступа

## Troubleshooting

### Проблема: API ключ не работает

1. Проверьте правильность копирования (без лишних пробелов)
2. Убедитесь что ключ активен в личном кабинете сервиса
3. Проверьте лимиты использования
4. Проверьте правильность BASE_URL

### Проблема: ФСБЦ API возвращает 403

1. Проверьте правильность API ключа и секрета
2. Убедитесь что у вас есть доступ к запрашиваемому региону
3. Проверьте не истек ли срок действия доступа

### Проблема: MCP Server не запускается

1. Проверьте что порт 3333 не занят
2. Убедитесь что все пути в конфигурации существуют
3. Проверьте логи в `./logs/mcp-server.log`

## Мониторинг использования

### DeepSeek API

- Лимиты отображаются в личном кабинете
- Логи использования в `./logs/deepseek-usage.log`

### ФСБЦ API

- Статистика доступна в личном кабинете ФСБЦ
- Кеширование снижает количество запросов

### Метрики

- Prometheus метрики доступны на `/metrics`
- Grafana дашборды в `./monitoring/dashboards/`

## Контакты поддержки

- **DeepSeek**: support@deepseek.com
- **Hugging Face**: api-enterprise@huggingface.co
- **ФСБЦ**: support@fsbc.ru, +7 (495) 123-45-67
- **Гранд Смета**: api@grandsmeta.ru

## Дополнительные ресурсы

- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [Hugging Face API Reference](https://huggingface.co/docs/api-inference)
- [ФСБЦ Техническая документация](https://api.fsbc.ru/docs)
- [MCP Protocol Specification](https://github.com/anthropics/mcp)
