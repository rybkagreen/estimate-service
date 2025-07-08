#!/bin/bash

# GitHub Copilot Organization Setup Script
# Автоматическая настройка Copilot для команды разработки Estimate Service

set -e

echo "🤖 Настройка GitHub Copilot для организации..."

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

if ! command -v jq &> /dev/null; then
    print_error "jq не установлен. Установите: sudo apt-get install jq"
    exit 1
fi

print_success "Все зависимости установлены"

# === Проверка аутентификации ===
print_status "Проверка аутентификации GitHub..."

if ! gh auth status &> /dev/null; then
    print_error "Не выполнен вход в GitHub CLI. Выполните: gh auth login"
    exit 1
fi

ORG_NAME=$(gh api user/orgs --jq '.[0].login' 2>/dev/null || echo "")
if [ -z "$ORG_NAME" ]; then
    print_error "Не удалось определить организацию. Убедитесь, что у вас есть права администратора."
    exit 1
fi

print_success "Аутентификация успешна. Организация: $ORG_NAME"

# === Настройка Copilot для организации ===
print_status "Настройка Copilot для организации $ORG_NAME..."

# Включение Copilot для организации
print_status "Включение GitHub Copilot Business/Enterprise..."
cat > copilot-org-settings.json << 'EOF'
{
  "seat_management_setting": "assign_selected",
  "public_code_suggestions": "block",
  "suggestion_matching_policy": "allow",
  "duplication_detection": "enabled"
}
EOF

# Применение настроек (требует GitHub Enterprise)
if gh api --method PUT /orgs/$ORG_NAME/copilot/billing --input copilot-org-settings.json 2>/dev/null; then
    print_success "Настройки Copilot применены"
else
    print_warning "Не удалось применить настройки автоматически. Настройте вручную в веб-интерфейсе."
fi

# === Создание команд ===
print_status "Создание команд разработчиков..."

# Определение команд
declare -A TEAMS=(
    ["tech-leads"]="Технические лидеры проекта"
    ["senior-developers"]="Старшие разработчики"
    ["developers"]="Разработчики"
    ["junior-developers"]="Младшие разработчики"
    ["domain-experts"]="Эксперты предметной области"
)

for team in "${!TEAMS[@]}"; do
    description="${TEAMS[$team]}"

    if gh api /orgs/$ORG_NAME/teams/$team &> /dev/null; then
        print_warning "Команда $team уже существует"
    else
        print_status "Создание команды $team..."
        gh api --method POST /orgs/$ORG_NAME/teams \
            --field name="$team" \
            --field description="$description" \
            --field privacy="closed" > /dev/null
        print_success "Команда $team создана"
    fi
done

# === Настройка доступа к репозиторию ===
print_status "Настройка доступа к репозиторию estimate-service..."

REPO_NAME="estimate-service"

# Права доступа для команд
declare -A TEAM_PERMISSIONS=(
    ["tech-leads"]="maintain"
    ["senior-developers"]="push"
    ["developers"]="push"
    ["junior-developers"]="triage"
    ["domain-experts"]="pull"
)

for team in "${!TEAM_PERMISSIONS[@]}"; do
    permission="${TEAM_PERMISSIONS[$team]}"
    print_status "Настройка прав $permission для команды $team..."

    gh api --method PUT /orgs/$ORG_NAME/teams/$team/repos/$ORG_NAME/$REPO_NAME \
        --field permission="$permission" 2>/dev/null || \
        print_warning "Не удалось настроить права для команды $team"
done

# === Выдача лицензий Copilot ===
print_status "Выдача лицензий GitHub Copilot..."

# Команды, которым нужен Copilot
COPILOT_TEAMS=("tech-leads" "senior-developers" "developers" "junior-developers")

for team in "${COPILOT_TEAMS[@]}"; do
    print_status "Выдача Copilot лицензий команде $team..."

    # Получение участников команды
    members=$(gh api /orgs/$ORG_NAME/teams/$team/members --jq '.[].login' 2>/dev/null || echo "")

    if [ -n "$members" ]; then
        for member in $members; do
            print_status "Выдача Copilot лицензии пользователю $member..."
            gh api --method PUT /orgs/$ORG_NAME/copilot/billing/selected_users \
                --field selected_usernames="[\"$member\"]" 2>/dev/null || \
                print_warning "Не удалось выдать лицензию пользователю $member"
        done
    else
        print_warning "Команда $team пуста или не найдена"
    fi
done

# === Настройка защиты веток ===
print_status "Настройка защиты веток..."

# Защита main ветки
print_status "Настройка защиты ветки main..."
cat > branch-protection-main.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "🔍 Code Quality Analysis",
      "🧪 Run All Tests",
      "🎯 Type Check",
      "🔐 Security Audit",
      "🤖 AI Code Review"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 2,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null
}
EOF

gh api --method PUT /repos/$ORG_NAME/$REPO_NAME/branches/main/protection \
    --input branch-protection-main.json 2>/dev/null || \
    print_warning "Не удалось настроить защиту ветки main"

# Защита develop ветки
print_status "Настройка защиты ветки develop..."
cat > branch-protection-develop.json << 'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "🔍 Code Quality Analysis",
      "🧪 Run All Tests"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false
  },
  "restrictions": null
}
EOF

gh api --method PUT /repos/$ORG_NAME/$REPO_NAME/branches/develop/protection \
    --input branch-protection-develop.json 2>/dev/null || \
    print_warning "Не удалось настроить защиту ветки develop"

# === Создание CODEOWNERS файла ===
print_status "Создание файла CODEOWNERS..."

cat > .github/CODEOWNERS << 'EOF'
# GitHub CODEOWNERS for Estimate Service
# Определяет ответственных за код review различных частей проекта

# === Global Owners ===
* @estimate-service/tech-leads

# === Backend Services ===
/services/ @estimate-service/tech-leads @estimate-service/senior-developers
/services/estimate-service/ @estimate-service/tech-leads @estimate-service/senior-developers
*.prisma @estimate-service/tech-leads @estimate-service/senior-developers

# === Frontend Application ===
/apps/estimate-frontend/ @estimate-service/tech-leads @estimate-service/senior-developers
/apps/estimate-frontend/src/components/ @estimate-service/senior-developers @estimate-service/developers

# === MCP Server ===
/mcp-server/ @estimate-service/tech-leads @estimate-service/senior-developers

# === Infrastructure & DevOps ===
/.github/ @estimate-service/tech-leads
/docker-compose*.yml @estimate-service/tech-leads
/Dockerfile @estimate-service/tech-leads
/.vscode/ @estimate-service/tech-leads

# === Documentation ===
/docs/ @estimate-service/tech-leads @estimate-service/domain-experts
README.md @estimate-service/tech-leads @estimate-service/domain-experts
CHANGELOG.md @estimate-service/tech-leads

# === Domain-Specific Files ===
# Файлы, связанные с ФСБЦ-2022 и строительными сметами
**/estimate/ @estimate-service/domain-experts @estimate-service/tech-leads
**/rate/ @estimate-service/domain-experts @estimate-service/tech-leads
**/calculation/ @estimate-service/domain-experts @estimate-service/tech-leads

# === Security & Configuration ===
**/security/ @estimate-service/tech-leads
**/.env* @estimate-service/tech-leads
**/secrets/ @estimate-service/tech-leads

# === Testing ===
**/*.test.ts @estimate-service/senior-developers @estimate-service/developers
**/*.spec.ts @estimate-service/senior-developers @estimate-service/developers
/test/ @estimate-service/senior-developers @estimate-service/developers
EOF

# === Настройка Dependabot ===
print_status "Настройка Dependabot..."

cat > .github/dependabot.yml << 'EOF'
version: 2
updates:
  # Enable version updates for npm
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "05:00"
    open-pull-requests-limit: 10
    reviewers:
      - "estimate-service/tech-leads"
    assignees:
      - "estimate-service/tech-leads"
    labels:
      - "dependencies"
      - "automated"

  # Enable version updates for Docker
  - package-ecosystem: "docker"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "tuesday"
    reviewers:
      - "estimate-service/tech-leads"

  # Enable version updates for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/.github/workflows"
    schedule:
      interval: "weekly"
      day: "wednesday"
    reviewers:
      - "estimate-service/tech-leads"
EOF

# === Создание шаблонов Issues ===
print_status "Создание шаблонов Issues..."

mkdir -p .github/ISSUE_TEMPLATE

cat > .github/ISSUE_TEMPLATE/copilot-improvement.md << 'EOF'
---
name: 🤖 Copilot Improvement
about: Предложение по улучшению использования GitHub Copilot
title: '[COPILOT] '
labels: ['copilot', 'improvement']
assignees: ['']
---

## 🎯 Цель улучшения
Опишите, какой аспект работы с Copilot нужно улучшить

## 📋 Текущая ситуация
Как Copilot используется сейчас и какие есть проблемы

## 💡 Предлагаемое решение
Детальное описание предлагаемого улучшения

## 🔄 Ожидаемый результат
Какие метрики улучшатся после внедрения

## 📚 Дополнительный контекст
Ссылки, примеры, скриншоты

## ✅ Критерии готовности
- [ ] Обновлена документация
- [ ] Проведено обучение команды
- [ ] Настроены метрики отслеживания
EOF

# === Финализация ===
print_status "Очистка временных файлов..."
rm -f copilot-org-settings.json branch-protection-*.json

print_success "✅ Настройка GitHub Copilot завершена!"

echo ""
echo "🎉 Следующие шаги:"
echo "1. Проверьте настройки в веб-интерфейсе GitHub"
echo "2. Добавьте участников в соответствующие команды"
echo "3. Проведите обучение команды по работе с Copilot"
echo "4. Настройте мониторинг использования Copilot"
echo ""
echo "📋 Полезные ссылки:"
echo "- Настройки организации: https://github.com/organizations/$ORG_NAME/settings/copilot"
echo "- Команды: https://github.com/orgs/$ORG_NAME/teams"
echo "- Репозиторий: https://github.com/$ORG_NAME/$REPO_NAME"
echo ""
print_success "Готово к работе! 🚀"
