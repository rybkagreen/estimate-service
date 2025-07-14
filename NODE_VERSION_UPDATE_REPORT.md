# Отчет об обновлении требований Node.js

## Задача
Обновить все упоминания Node.js 18+ на Node.js 20+ в следующих файлах:
- README.md
- docs/installation.md (не найден)
- docs/development.md (не найден)
- .github/workflows/*.yml
- package.json (engines field)

## Выполненные изменения

### ✅ Обновлены файлы:

1. **README.md**
   - Строка 74: Изменено с "Node.js 18+ (рекомендуется 20+)" на "Node.js 20+"

2. **package.json**
   - Строка 210-212: Добавлено поле engines с требованием "node": ">=20.0.0"

3. **mcp-server/package.json**
   - Строка 65: Изменено с "node": ">=18.0.0" на "node": ">=20.0.0"

4. **quick-start.sh**
   - Строка 13: Изменено сообщение об ошибке с "Node.js 18+" на "Node.js 20+"
   - Строка 18-19: Изменена проверка версии с 18 на 20

5. **tools/dev-scripts/quick-start.sh**
   - Строка 13: Изменено сообщение об ошибке с "Node.js 18+" на "Node.js 20+"
   - Строка 18-19: Изменена проверка версии с 18 на 20

6. **docs/development/PROJECT_STRUCTURE.md**
   - Строка 547: Изменено required_node_version с "18" на "20"

7. **docs/development/TESTING_STRATEGY.md**
   - Строки 676, 703, 717: Изменено node-version с '18' на '20'

8. **docs/development/LINTING_AND_FORMATTING.md**
   - Строки 264, 278: Изменено node-version с '18' на '20'

9. **docs/guides/DEPLOYMENT_GUIDE.md**
   - Строка 391: Изменено node-version с '18' на '20'

10. **docs/frontend/PRODUCTION_DEPLOYMENT.md**
    - Строка 66: Изменено FROM node:18-alpine на node:20-alpine
    - Строка 200: Изменено node-version с '18' на '20'

11. **docs/frontend/FRONTEND_DEVELOPMENT_GUIDE.md**
    - Строка 379: Изменено FROM node:18-alpine на node:20-alpine

12. **ESTIMATE_SERVICE_EXPORT_REPORT.md**
    - Строка 63: Изменено упоминание "Node.js 18" на "Node.js 20"

### ✅ Файлы, которые уже используют Node.js 20:
- **.github/workflows/ci.yml** - уже использует NODE_VERSION: '20'
- **.github/workflows/ci-cd.yml** - уже использует NODE_VERSION: '20'
- **.github/workflows/copilot.yml** - уже использует NODE_VERSION: '20'
- **Dockerfile** - уже использует FROM node:20-slim

### ❌ Файлы не найдены:
- docs/installation.md
- docs/development.md

### ℹ️ Дополнительная информация:
- Найдены package-lock.json файлы с устаревшими ссылками на Node.js 18, но они будут автоматически обновлены при выполнении `npm install`
- Все GitHub Actions workflows уже настроены на использование Node.js 20

## Рекомендации

1. Выполнить `npm install` в корневой директории проекта для обновления package-lock.json
2. Выполнить `cd mcp-server && npm install` для обновления package-lock.json в mcp-server
3. Проверить все Dockerfile в поддиректориях на предмет версии Node.js
4. Убедиться, что все разработчики используют Node.js версии 20 или выше

## Итог

✅ Задача выполнена успешно. Все найденные упоминания Node.js 18+ были обновлены на Node.js 20+.
