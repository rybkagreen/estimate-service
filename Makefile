# Makefile for Estimate Service Parallel Development
# Управление параллельной разработкой с MCP сервером

.PHONY: help dev-all dev-frontend dev-backend dev-mcp setup clean test build

# Цвета для вывода
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
RED=\033[0;31m
NC=\033[0m # No Color

# Default target
help: ## Показать справку по командам
	@echo "$(BLUE)🚀 Estimate Service - Параллельная разработка$(NC)"
	@echo "$(BLUE)================================================$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)📝 Команды разработки:$(NC)"
	@echo "  make dev-all        - Запуск всех сервисов параллельно"
	@echo "  make dev-frontend   - Только frontend команда"
	@echo "  make dev-backend    - Только backend команда"
	@echo "  make dev-mcp        - Только MCP команда"

# ===================
# DEVELOPMENT COMMANDS
# ===================

dev-all: ## Запуск всех сервисов для параллельной разработки
	@echo "$(GREEN)🚀 Запуск всех сервисов для командной разработки...$(NC)"
	npm run dev:all

dev-frontend: ## Frontend команда - React/Vite приложение
	@echo "$(BLUE)🎨 Запуск Frontend команды...$(NC)"
	@echo "$(YELLOW)Порт: 4200$(NC)"
	npm run dev:frontend

dev-backend: ## Backend команда - NestJS сервис
	@echo "$(BLUE)🔧 Запуск Backend команды...$(NC)"
	@echo "$(YELLOW)Порт: 3022$(NC)"
	npm run dev:backend

dev-mcp: ## MCP команда - HTTP сервер
	@echo "$(BLUE)🤖 Запуск MCP команды...$(NC)"
	@echo "$(YELLOW)Порт: 9460$(NC)"
	npm run dev:mcp

dev-mcp-stdio: ## MCP команда - STDIO режим
	@echo "$(BLUE)🤖 Запуск MCP в STDIO режиме...$(NC)"
	npm run dev:mcp-stdio

dev-mcp-api: ## MCP команда - DeepSeek R1 через Hugging Face API
	@echo "$(BLUE)🤖 Запуск MCP с DeepSeek R1 API...$(NC)"
	@echo "$(YELLOW)Требует: HF_TOKEN$(NC)"
	npm run dev:deepseek-api

dev-mcp-simple: ## MCP команда - простой режим эмуляции
	@echo "$(BLUE)🤖 Запуск MCP в режиме эмуляции...$(NC)"
	npm run dev:simple

team-sync:
	@echo "🔄 Syncing team environment..."
	git pull origin main
	npm install
	npm run build:all
	@echo "✅ Team sync complete!"

# Development Commands
dev-all:
	@echo "🚀 Starting all development services..."
	npm run dev:all

dev-frontend:
	@echo "💻 Starting frontend development..."
	npm run dev:frontend

dev-backend:
	@echo "🔧 Starting backend development..."
	npm run dev:backend

dev-mcp:
	@echo "🤖 Starting MCP server..."
	npm run dev:mcp

dev-docker:
	@echo "🐳 Starting development with Docker..."
	docker-compose -f docker-compose.teams.yml up -d
	@echo "✅ Services started:"
	@echo "  - Frontend: http://localhost:4200"
	@echo "  - Backend: http://localhost:3333"
	@echo "  - MCP Server: http://localhost:9460"
	@echo "  - Prisma Studio: http://localhost:5555"
	@echo "  - Grafana: http://localhost:3000 (admin/admin)"

# Testing Commands
test-all:
	@echo "🧪 Running all tests..."
	npm run test:all

test-frontend:
	@echo "🧪 Running frontend tests..."
	cd apps/estimate-frontend && npm run test

test-backend:
	@echo "🧪 Running backend tests..."
	cd services/estimate-service && npm run test

test-mcp:
	@echo "🧪 Running MCP tests..."
	npm run mcp:test

test-e2e:
	@echo "🧪 Running end-to-end tests..."
	npm run test:e2e

test-mcp-api: ## Тестирование MCP сервера с DeepSeek R1 API
	@echo "🧪 Тестирование MCP с DeepSeek R1 API..."
	@echo "$(YELLOW)Требует: HF_TOKEN$(NC)"
	cd mcp-server && npm run test:api

test-mcp-local: ## Тестирование локального MCP сервера
	@echo "🧪 Тестирование локального MCP сервера..."
	cd mcp-server && npm run test:local

# Build Commands
build-all:
	@echo "🏗️ Building all projects..."
	npm run build:all

build-mcp:
	@echo "🏗️ Building MCP server..."
	npm run mcp:build

# Database Commands
db-setup:
	@echo "🗄️ Setting up development database..."
	docker-compose -f docker-compose.teams.yml up postgres-dev redis-dev -d
	sleep 5
	npx prisma migrate dev --name init
	npx prisma db seed
	@echo "✅ Database setup complete!"

db-reset:
	@echo "🔄 Resetting development database..."
	npx prisma migrate reset --force
	@echo "✅ Database reset complete!"

db-studio:
	@echo "🎨 Opening Prisma Studio..."
	npx prisma studio

# Utility Commands
lint-all:
	@echo "🔍 Linting all projects..."
	npm run lint:all

format-all:
	@echo "🎨 Formatting all code..."
	npm run format

clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf apps/*/dist/
	rm -rf services/*/dist/
	rm -rf mcp-server/dist*/
	rm -rf node_modules/.cache/
	@echo "✅ Clean complete!"

# Team-specific commands
team-frontend:
	@echo "💻 Starting Frontend Team Environment..."
	make dev-frontend &
	make dev-mcp &
	@echo "✅ Frontend team environment ready!"

team-backend:
	@echo "🔧 Starting Backend Team Environment..."
	make db-setup
	make dev-backend &
	make dev-mcp &
	@echo "✅ Backend team environment ready!"

team-infrastructure:
	@echo "🏗️ Starting Infrastructure Team Environment..."
	make dev-docker
	@echo "✅ Infrastructure team environment ready!"

team-ai:
	@echo "🤖 Starting AI/MCP Team Environment..."
	make dev-mcp &
	make test-mcp
	@echo "✅ AI/MCP team environment ready!"

# Stop all services
stop:
	@echo "🛑 Stopping all services..."
	docker-compose -f docker-compose.teams.yml down
	pkill -f "npm run dev" || true
	pkill -f "node.*index" || true
	@echo "✅ All services stopped!"

# Check service status
status:
	@echo "📊 Service Status:"
	@echo "Frontend (4200): $(shell curl -s -o /dev/null -w "%{http_code}" http://localhost:4200 || echo "❌ Down")"
	@echo "Backend (3333): $(shell curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/health || echo "❌ Down")"
	@echo "MCP (9460): $(shell curl -s -o /dev/null -w "%{http_code}" http://localhost:9460/health || echo "❌ Down")"
	@echo "Prisma Studio (5555): $(shell curl -s -o /dev/null -w "%{http_code}" http://localhost:5555 || echo "❌ Down")"
