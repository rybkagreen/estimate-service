#!/usr/bin/env node

/**
 * Скрипт проверки конфигурации GitHub Copilot для Estimate Service
 * Проверяет настройки VS Code, файлы контекста и права доступа
 */

const fs = require('fs');
const path = require('path');

// Цветной вывод
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(level, message) {
  const color = colors[level] || colors.reset;
  console.log(`${color}[${level.toUpperCase()}]${colors.reset} ${message}`);
}

function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('green', `✅ ${description}: ${filePath}`);
    return true;
  } else {
    log('red', `❌ ${description} отсутствует: ${filePath}`);
    return false;
  }
}

function checkJSONFile(filePath, description, requiredKeys = []) {
  if (!checkFileExists(filePath, description)) {
    return false;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Для VS Code JSONC файлов, удаляем комментарии перед парсингом
    if (filePath.includes('.vscode/')) {
      content = content.replace(/\/\*[\s\S]*?\*\//g, ''); // Удаляем /* */ комментарии
      content = content.replace(/\/\/.*$/gm, ''); // Удаляем // комментарии
    }

    const parsedContent = JSON.parse(content);

    for (const key of requiredKeys) {
      if (!(key in parsedContent)) {
        log('yellow', `⚠️ ${description}: отсутствует ключ "${key}"`);
        return false;
      }
    }

    log('green', `✅ ${description} корректный`);
    return true;
  } catch (error) {
    log('red', `❌ ${description} содержит ошибки: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🤖 Проверка конфигурации GitHub Copilot для Estimate Service\n');

  let score = 0;
  let total = 0;

  // === Проверка основных файлов конфигурации ===
  log('blue', '📁 Проверка файлов конфигурации...');

  total += 1;
  if (checkJSONFile('.vscode/settings.json', 'VS Code настройки', ['github.copilot.enable'])) {
    score += 1;
  }

  total += 1;
  if (checkJSONFile('.vscode/extensions.json', 'Рекомендуемые расширения', ['recommendations'])) {
    score += 1;
  }

  total += 1;
  if (checkJSONFile('.vscode/copilot.json', 'Copilot настройки', ['github.copilot.enable'])) {
    score += 1;
  }

  // === Проверка файлов контекста ===
  log('blue', '\n📋 Проверка файлов контекста...');

  total += 1;
  if (checkFileExists('.github/copilot-workspace.yml', 'Workspace контекст')) {
    score += 1;
  }

  total += 1;
  if (checkFileExists('.github/COPILOT_CONTEXT.md', 'Документация контекста')) {
    score += 1;
  }

  total += 1;
  if (checkJSONFile('.github/copilot-prompts.json', 'Готовые промпты', ['prompts'])) {
    score += 1;
  }

  // === Проверка DevContainer ===
  log('blue', '\n🐳 Проверка DevContainer...');

  total += 1;
  if (checkJSONFile('.github/codespaces/devcontainer.json', 'DevContainer конфигурация', ['customizations'])) {
    score += 1;
  }

  // === Проверка Nx интеграции ===
  log('blue', '\n⚡ Проверка Nx интеграции...');

  total += 1;
  if (checkJSONFile('nx.json', 'Nx конфигурация')) {
    score += 1;
  }

  total += 1;
  if (checkJSONFile('.nx/copilot-config.json', 'Nx Copilot настройки', ['copilot'])) {
    score += 1;
  }

  // === Проверка GitHub Actions ===
  log('blue', '\n🔄 Проверка GitHub Actions...');

  total += 1;
  if (checkFileExists('.github/workflows/ai-code-review.yml', 'AI Code Review workflow')) {
    score += 1;
  }

  total += 1;
  if (checkFileExists('.github/workflows/ci-cd.yml', 'CI/CD workflow')) {
    score += 1;
  }

  // === Проверка командных файлов ===
  log('blue', '\n👥 Проверка командных файлов...');

  total += 1;
  if (checkFileExists('.github/TEAM_SETUP.md', 'Инструкции для команды')) {
    score += 1;
  }

  total += 1;
  if (checkFileExists('.github/PERMISSIONS.md', 'Конфигурация прав')) {
    score += 1;
  }

  total += 1;
  if (checkFileExists('.github/CODEOWNERS', 'Code owners')) {
    score += 1;
  }

  // === Проверка скриптов ===
  log('blue', '\n🔧 Проверка скриптов...');

  const scripts = [
    '.github/setup-codespaces.sh',
    '.github/setup-organization.sh'
  ];

  for (const script of scripts) {
    total += 1;
    if (checkFileExists(script, `Скрипт ${path.basename(script)}`)) {
      // Проверка прав на выполнение
      try {
        const stats = fs.statSync(script);
        if (stats.mode & 0o111) {
          log('green', `✅ Скрипт ${script} исполняемый`);
          score += 1;
        } else {
          log('yellow', `⚠️ Скрипт ${script} не исполняемый. Выполните: chmod +x ${script}`);
        }
      } catch (error) {
        log('red', `❌ Ошибка проверки прав: ${error.message}`);
      }
    }
  }

  // === Проверка package.json скриптов ===
  log('blue', '\n📦 Проверка npm скриптов...');

  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredScripts = [
      'copilot:check',
      'team:setup',
      'ai:review',
      'quality:full'
    ];

    for (const scriptName of requiredScripts) {
      total += 1;
      if (packageJson.scripts && packageJson.scripts[scriptName]) {
        log('green', `✅ Скрипт "${scriptName}" настроен`);
        score += 1;
      } else {
        log('red', `❌ Скрипт "${scriptName}" отсутствует`);
      }
    }
  } catch (error) {
    log('red', `❌ Ошибка чтения package.json: ${error.message}`);
  }

  // === Итоговый отчет ===
  console.log('\n' + '='.repeat(50));

  const percentage = Math.round((score / total) * 100);
  const status = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red';

  log(status, `📊 Результат: ${score}/${total} (${percentage}%)`);

  if (percentage >= 90) {
    log('green', '🎉 Отличная конфигурация! Copilot готов к работе.');
  } else if (percentage >= 70) {
    log('yellow', '⚠️ Хорошая конфигурация, но есть что улучшить.');
  } else {
    log('red', '❌ Конфигурация требует доработки.');
  }

  console.log('\n🔗 Полезные ссылки:');
  console.log('📖 Документация: .github/COPILOT_CONTEXT.md');
  console.log('👥 Настройка команды: .github/TEAM_SETUP.md');
  console.log('🔐 Права доступа: .github/PERMISSIONS.md');
  console.log('🤖 Готовые промпты: .github/copilot-prompts.json');

  process.exit(percentage >= 70 ? 0 : 1);
}

if (require.main === module) {
  main();
}
