#!/bin/bash

# GitHub Copilot Workspace Initialization Script
# Инициализация GitHub Copilot workspace для Estimate Service

set -e

echo "🤖 Инициализация GitHub Copilot Workspace для Estimate Service..."

# === Цветной вывод ===
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# === Проверка зависимостей ===
print_status "Проверка зависимостей..."

if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI не установлен. Установите: https://cli.github.com/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    print_error "Node.js не установлен"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm не установлен"
    exit 1
fi

print_success "Все зависимости установлены"

# === Проверка аутентификации GitHub ===
print_status "Проверка аутентификации GitHub..."

if ! gh auth status &> /dev/null; then
    print_warning "Не выполнен вход в GitHub CLI. Выполняем аутентификацию..."
    gh auth login
fi

print_success "Аутентификация GitHub успешна"

# === Инициализация Copilot Workspace ===
print_status "Инициализация GitHub Copilot Workspace..."

# Проверяем, что мы в git репозитории
if [ ! -d ".git" ]; then
    print_error "Не найден git репозиторий. Убедитесь, что вы находитесь в корне проекта."
    exit 1
fi

# Получаем информацию о репозитории
REPO_URL=$(git config --get remote.origin.url 2>/dev/null || echo "")
if [ -z "$REPO_URL" ]; then
    print_warning "Remote origin не настроен. Настройка локального workspace..."
    LOCAL_MODE=true
else
    print_success "Репозиторий: $REPO_URL"
    LOCAL_MODE=false
fi

# === Создание workspace manifest ===
print_status "Создание workspace manifest..."

cat > .github/copilot-workspace-manifest.json << 'EOF'
{
  "version": "1.0",
  "name": "estimate-service",
  "description": "ИИ-ассистент для составления строительных смет с интеграцией ФСБЦ-2022",
  "type": "nx-monorepo",
  "technologies": {
    "backend": ["NestJS", "TypeScript", "Prisma", "PostgreSQL", "Redis"],
    "frontend": ["React", "TypeScript", "Vite", "Tailwind CSS"],
    "ai": ["DeepSeek R1", "Hugging Face", "MCP"],
    "infrastructure": ["Docker", "GitHub Actions", "Codespaces"]
  },
  "architecture": {
    "pattern": "Clean Architecture",
    "domain": "Domain-Driven Design",
    "cqrs": true,
    "eventSourcing": true
  },
  "workspace": {
    "type": "nx",
    "version": "17.2.8",
    "packageManager": "npm"
  },
  "projects": [
    {
      "name": "estimate-service",
      "type": "application",
      "framework": "nestjs",
      "path": "services/estimate-service"
    },
    {
      "name": "estimate-frontend",
      "type": "application",
      "framework": "react",
      "path": "apps/estimate-frontend"
    },
    {
      "name": "mcp-server",
      "type": "application",
      "framework": "node",
      "path": "mcp-server"
    },
    {
      "name": "shared-contracts",
      "type": "library",
      "framework": "typescript",
      "path": "libs/shared-contracts"
    }
  ],
  "domains": [
    {
      "name": "estimate-management",
      "description": "Управление строительными сметами",
      "entities": ["Estimate", "EstimateItem", "Rate", "Material", "Work"]
    },
    {
      "name": "pricing",
      "description": "Ценообразование и расчеты",
      "entities": ["PriceItem", "RegionalCoefficient", "OverheadCost", "Profit"]
    },
    {
      "name": "integration",
      "description": "Интеграция с внешними системами",
      "entities": ["FSBTSIntegration", "GrandSmetaExport", "AIService"]
    }
  ],
  "copilot": {
    "context": ".github/COPILOT_CONTEXT.md",
    "prompts": ".github/copilot-prompts.json",
    "workspace": ".github/copilot-workspace.yml",
    "settings": ".vscode/copilot.json"
  }
}
EOF

print_success "Workspace manifest создан"

# === Инициализация с GitHub Copilot CLI ===
print_status "Инициализация GitHub Copilot Workspace..."

# Проверяем расширение copilot
if ! gh extension list | grep -q "copilot"; then
    print_status "Устанавливаем расширение GitHub Copilot..."
    gh extension install github/gh-copilot
fi

# Создаем workspace context для Copilot
print_status "Создание контекста workspace для Copilot..."

cat > .copilot-workspace << 'EOF'
# GitHub Copilot Workspace Context

## Project Overview
Estimate Service - ИИ-ассистент для составления строительных смет

## Domain
Construction cost estimation, ФСБЦ-2022 integration, Grand Smeta compatibility

## Architecture
- Pattern: Clean Architecture + DDD
- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: React + TypeScript + Vite + Tailwind
- AI: DeepSeek R1 + Hugging Face + MCP
- Monorepo: Nx workspace

## Key Concepts
- Смета (Estimate) - construction cost estimate
- Расценка (Rate) - pricing item from ФСБЦ-2022
- Накладные расходы (Overhead) - overhead costs
- Сметная прибыль (Profit) - estimated profit margin

## Development Patterns
- Use decimal.js for monetary calculations
- Follow NestJS best practices
- Implement comprehensive testing
- Document domain logic in Russian
- Technical comments in English

## Typical Tasks
- CRUD operations for estimates
- Integration with ФСБЦ-2022 API
- Export to Grand Smeta format
- Cost calculation algorithms
- Regional coefficient application
EOF

print_success "Workspace context создан"

# === Настройка проекта ===
print_status "Настройка проекта для Copilot..."

# Обновляем package.json для workspace
if [ -f "package.json" ]; then
    print_status "Добавляем Copilot workspace metadata в package.json..."

    # Создаем временный файл с обновленным package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    pkg.copilot = {
      workspace: true,
      type: 'nx-monorepo',
      domain: 'construction-estimation',
      context: '.github/COPILOT_CONTEXT.md'
    };

    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
    "

    print_success "package.json обновлен"
fi

# === Создание workspace tasks ===
print_status "Создание Copilot workspace tasks..."

mkdir -p .github/copilot-tasks

cat > .github/copilot-tasks/common-tasks.json << 'EOF'
{
  "tasks": [
    {
      "name": "create-estimate-entity",
      "description": "Создать новую сущность для сметы",
      "prompt": "Создай новую Entity для управления строительными сметами с валидацией ФСБЦ-2022, включая DTO, Service, Controller и тесты",
      "files": ["src/entities/", "src/dto/", "src/services/", "src/controllers/"],
      "tags": ["entity", "crud", "backend"]
    },
    {
      "name": "implement-calculator",
      "description": "Реализовать калькулятор стоимости",
      "prompt": "Реализуй сервис расчета стоимости строительных работ с учетом региональных коэффициентов и накладных расходов",
      "files": ["src/services/calculator/", "src/types/calculation.ts"],
      "tags": ["calculation", "business-logic", "backend"]
    },
    {
      "name": "add-integration",
      "description": "Добавить интеграцию с внешним API",
      "prompt": "Создай сервис интеграции с API ФСБЦ-2022 для получения актуальных расценок",
      "files": ["src/integrations/", "src/services/external/"],
      "tags": ["integration", "api", "external"]
    },
    {
      "name": "create-frontend-component",
      "description": "Создать React компонент",
      "prompt": "Создай React компонент для отображения и редактирования сметы с использованием Tailwind CSS",
      "files": ["src/components/", "src/pages/", "src/hooks/"],
      "tags": ["frontend", "react", "ui"]
    },
    {
      "name": "add-tests",
      "description": "Добавить тесты",
      "prompt": "Создай comprehensive тесты для указанного модуля с покрытием позитивных, негативных сценариев и edge cases",
      "files": ["src/**/*.spec.ts", "test/"],
      "tags": ["testing", "quality"]
    }
  ]
}
EOF

print_success "Copilot tasks созданы"

# === Генерация проектной документации ===
print_status "Генерация проектной документации..."

# Анализ проекта с помощью Nx
if command -v npx &> /dev/null; then
    print_status "Анализ Nx workspace..."
    npx nx graph --file=.github/project-structure.json 2>/dev/null || true

    print_status "Генерация списка проектов..."
    npx nx show projects > .github/nx-projects.txt 2>/dev/null || true
fi

# === Инициализация Git hooks для Copilot ===
print_status "Настройка Git hooks для Copilot..."

mkdir -p .githooks

cat > .githooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook для проверки Copilot workspace

echo "🤖 Проверка Copilot workspace перед коммитом..."

# Проверка конфигурации Copilot
if [ -f "scripts/check-copilot.js" ]; then
    node scripts/check-copilot.js
    if [ $? -ne 0 ]; then
        echo "❌ Copilot конфигурация содержит ошибки"
        exit 1
    fi
fi

echo "✅ Copilot workspace готов"
EOF

chmod +x .githooks/pre-commit

# Настройка Git hooks
git config core.hooksPath .githooks 2>/dev/null || true

print_success "Git hooks настроены"

# === Финальная проверка ===
print_status "Финальная проверка workspace..."

# Проверка всех созданных файлов
FILES_TO_CHECK=(
    ".github/copilot-workspace-manifest.json"
    ".copilot-workspace"
    ".github/copilot-tasks/common-tasks.json"
    ".githooks/pre-commit"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file создан"
    else
        print_warning "⚠️ $file не найден"
    fi
done

# === Запуск проверки конфигурации ===
if [ -f "scripts/check-copilot.js" ]; then
    print_status "Запуск проверки конфигурации..."
    node scripts/check-copilot.js
fi

print_success "✅ GitHub Copilot Workspace успешно инициализирован!"

echo ""
echo "🎉 Следующие шаги:"
echo "1. Откройте VS Code в этой директории"
echo "2. Убедитесь, что расширение GitHub Copilot установлено"
echo "3. Используйте Ctrl+I для открытия Copilot Chat"
echo "4. Попробуйте промпты из .github/copilot-prompts.json"
echo ""
echo "📚 Полезные команды:"
echo "- gh copilot suggest - предложения команд"
echo "- gh copilot explain - объяснение кода"
echo "- npm run copilot:check - проверка конфигурации"
echo ""
print_success "Готово к работе! 🚀"
