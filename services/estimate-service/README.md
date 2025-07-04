# estimate-service

## Описание
Микросервис для [описание функциональности]

## Установка
```bash
/usr/local/bin/pnpm install
```

## Запуск
```bash
# Development
/usr/local/bin/pnpm nx serve estimate-service

# Production build
/usr/local/bin/pnpm nx build estimate-service
```

## API Документация
- Health check: `GET /health`
- Metrics: `GET /metrics`

## Переменные окружения
См. файл `.env.example`

## Тестирование
```bash
/usr/local/bin/pnpm nx test estimate-service
```
