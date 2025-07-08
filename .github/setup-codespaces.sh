#!/bin/bash

# Codespaces Environment Setup Script for Estimate Service
# Автоматическая настройка среды разработки для работы с GitHub Copilot

set -e

echo "🚀 Настройка среды разработки Estimate Service для GitHub Copilot..."

# === Git Configuration ===
echo "📝 Настройка Git..."
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global core.autocrlf false
git config --global core.eol lf

# === Node.js и npm настройка ===
echo "📦 Настройка Node.js..."
npm config set fund false
npm config set audit-level moderate

# === Установка зависимостей ===
echo "⬇️ Установка зависимостей..."
npm install --silent

# === Генерация Prisma клиента ===
echo "🗄️ Генерация Prisma клиента..."
npx prisma generate

# === Настройка переменных окружения ===
echo "🔧 Настройка переменных окружения..."
if [ ! -f .env ]; then
  cp .env.example .env 2>/dev/null || echo "⚠️ .env.example не найден"
fi

# === Создание директорий для логов ===
echo "📁 Создание директорий..."
mkdir -p logs temp uploads reports
mkdir -p .temp/logs .temp/cache

# === Права доступа ===
echo "🔐 Настройка прав доступа..."
chmod +x scripts/*.js scripts/*.sh 2>/dev/null || true

# === GitHub Copilot настройки ===
echo "🤖 Настройка GitHub Copilot..."

# Создание пользовательских настроек для Copilot
mkdir -p ~/.config/code-server/User
cat > ~/.config/code-server/User/settings.json << 'EOF'
{
  "github.copilot.enable": {
    "*": true,
    "typescript": true,
    "javascript": true,
    "prisma": true,
    "yaml": true,
    "markdown": true
  },
  "github.copilot.advanced": {
    "length": 500,
    "temperature": "0.1"
  },
  "github.copilot.chat.localeOverride": "ru",
  "editor.inlineSuggest.enabled": true,
  "editor.formatOnSave": true
}
EOF

# === Информация о проекте для Copilot ===
echo "📋 Создание контекстного файла для Copilot..."
cat > .copilot-context << 'EOF'
# Estimate Service - Контекст для GitHub Copilot

## Тип проекта
ИИ-ассистент для составления строительных смет

## Технологии
- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: React + TypeScript + Vite + Tailwind
- AI: DeepSeek R1 + Hugging Face + MCP
- Infrastructure: Docker + GitHub Actions

## Специфичные термины
- Смета = estimate
- Расценка = rate/price item
- ФСБЦ = federal pricing database
- Накладные расходы = overhead costs

## Паттерны
- Domain-Driven Design
- Clean Architecture
- CQRS pattern
- Event Sourcing

## Стандарты кода
- ESLint + Prettier обязательны
- TypeScript strict mode
- Покрытие тестами 80%+
- JSDoc для public методов
EOF

# === Проверка Docker ===
echo "🐳 Проверка Docker..."
if command -v docker &> /dev/null; then
  echo "✅ Docker доступен"
else
  echo "⚠️ Docker не найден"
fi

# === Проверка портов ===
echo "🌐 Проверка доступности портов..."
for port in 3000 3001 3022 5432; do
  if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✅ Порт $port свободен"
  else
    echo "⚠️ Порт $port занят"
  fi
done

# === Финальная проверка ===
echo "🔍 Проверка состояния проекта..."

# Проверка TypeScript
if npx tsc --noEmit --skipLibCheck; then
  echo "✅ TypeScript компилируется без ошибок"
else
  echo "⚠️ Обнаружены ошибки TypeScript"
fi

# Проверка линтинга
if npm run lint:all &>/dev/null; then
  echo "✅ Код соответствует стандартам линтинга"
else
  echo "⚠️ Обнаружены нарушения стандартов кода"
fi

echo ""
echo "🎉 Среда разработки настроена!"
echo ""
echo "📚 Полезные команды:"
echo "  npm run dev:all        - Запуск всех сервисов"
echo "  npm run test:all       - Запуск всех тестов"
echo "  npm run lint:all       - Проверка кода"
echo "  npm run docs:check     - Проверка документации"
echo ""
echo "🤖 GitHub Copilot готов к работе!"
echo "   Используйте Ctrl+I для вызова Copilot Chat"
echo "   Читайте .github/COPILOT_CONTEXT.md для лучших практик"
echo ""
