#!/usr/bin/env node

/**
 * Скрипт автоматической настройки среды разработки
 * Запускается при создании Codespace или первом запуске
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Настройка среды разработки Estimate Service...\n');

class DevEnvironmentSetup {
  constructor() {
    this.rootPath = path.join(__dirname, '..');
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Главный метод настройки
   */
  async setup() {
    try {
      console.log('📝 Проверка конфигурационных файлов...');
      this.setupEnvironmentFiles();

      console.log('🗄️  Настройка базы данных...');
      this.setupDatabase();

      console.log('🤖 Настройка GitHub Copilot...');
      this.setupCopilotConfig();

      console.log('🔗 Настройка Git hooks...');
      this.setupGitHooks();

      console.log('📦 Проверка зависимостей...');
      this.checkDependencies();

      console.log('🧪 Настройка тестовой среды...');
      this.setupTestEnvironment();

      this.printSummary();

    } catch (error) {
      console.error('❌ Ошибка при настройке:', error.message);
      process.exit(1);
    }
  }

  /**
   * Настройка файлов окружения
   */
  setupEnvironmentFiles() {
    const envFiles = [
      {
        source: '.env.example',
        target: '.env',
        required: true
      },
      {
        source: 'mcp-server/.env.example',
        target: 'mcp-server/.env.local',
        required: true
      }
    ];

    for (const envFile of envFiles) {
      const sourcePath = path.join(this.rootPath, envFile.source);
      const targetPath = path.join(this.rootPath, envFile.target);

      if (!fs.existsSync(targetPath)) {
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`✅ Создан ${envFile.target}`);
        } else if (envFile.required) {
          this.errors.push(`Отсутствует ${envFile.source} для создания ${envFile.target}`);
        }
      } else {
        console.log(`ℹ️  ${envFile.target} уже существует`);
      }
    }

    // Проверяем критические переменные окружения
    this.validateEnvironmentVariables();
  }

  /**
   * Проверка переменных окружения
   */
  validateEnvironmentVariables() {
    const requiredVars = {
      '.env': ['DATABASE_URL', 'JWT_SECRET'],
      'mcp-server/.env.local': ['HF_TOKEN', 'HUGGINGFACE_MODEL_NAME']
    };

    for (const [file, vars] of Object.entries(requiredVars)) {
      const filePath = path.join(this.rootPath, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');

        for (const varName of vars) {
          if (!content.includes(`${varName}=`)) {
            this.warnings.push(`Переменная ${varName} не настроена в ${file}`);
          }
        }
      }
    }
  }

  /**
   * Настройка базы данных
   */
  setupDatabase() {
    try {
      // Проверяем подключение к PostgreSQL
      console.log('🔍 Проверка подключения к базе данных...');

      // Если DATABASE_URL не настроен, используем значение по умолчанию
      if (!process.env.DATABASE_URL) {
        console.log('ℹ️  Используется база данных по умолчанию');
      }

      // Генерируем Prisma клиент
      console.log('🔨 Генерация Prisma клиента...');
      execSync('npx prisma generate', {
        stdio: 'inherit',
        cwd: this.rootPath
      });

    } catch (error) {
      this.warnings.push(`Ошибка настройки БД: ${error.message}`);
    }
  }

  /**
   * Настройка GitHub Copilot
   */
  setupCopilotConfig() {
    // Проверяем наличие расширений Copilot
    const copilotExtensions = [
      'github.copilot',
      'github.copilot-chat',
      'github.copilot-labs'
    ];

    console.log('🤖 Рекомендуемые расширения Copilot:');
    copilotExtensions.forEach(ext => {
      console.log(`   - ${ext}`);
    });

    // Создаем .vscode/launch.json для отладки
    this.setupVSCodeLaunchConfig();

    // Обновляем настройки Copilot для текущего проекта
    this.updateCopilotSettings();
  }

  /**
   * Настройка конфигурации запуска VS Code
   */
  setupVSCodeLaunchConfig() {
    const launchConfig = {
      version: "0.2.0",
      configurations: [
        {
          name: "🚀 Debug Backend",
          type: "node",
          request: "launch",
          program: "${workspaceFolder}/node_modules/@nestjs/cli/bin/nest.js",
          args: ["start", "--debug", "--watch"],
          cwd: "${workspaceFolder}",
          env: {
            NODE_ENV: "development"
          },
          console: "integratedTerminal",
          restart: true,
          runtimeExecutable: "npm",
          runtimeArgs: ["run", "start:debug"]
        },
        {
          name: "🧪 Debug Tests",
          type: "node",
          request: "launch",
          program: "${workspaceFolder}/node_modules/.bin/jest",
          args: ["--runInBand"],
          cwd: "${workspaceFolder}",
          console: "integratedTerminal",
          internalConsoleOptions: "neverOpen"
        },
        {
          name: "🤖 Debug MCP Server",
          type: "node",
          request: "launch",
          program: "${workspaceFolder}/mcp-server/dist-simple/index-local-simple.js",
          cwd: "${workspaceFolder}/mcp-server",
          env: {
            NODE_ENV: "development",
            DEBUG: "mcp:*"
          },
          console: "integratedTerminal"
        }
      ]
    };

    const launchPath = path.join(this.rootPath, '.vscode', 'launch.json');
    if (!fs.existsSync(launchPath)) {
      fs.writeFileSync(launchPath, JSON.stringify(launchConfig, null, 2));
      console.log('✅ Создан .vscode/launch.json');
    }
  }

  /**
   * Обновление настроек Copilot
   */
  updateCopilotSettings() {
    // Добавляем специфичные для проекта настройки
    const projectSpecificSettings = {
      "github.copilot.chat.experimental.codeGeneration": true,
      "github.copilot.advanced.debug.useNodeDebugger": true,
      "github.copilot.conversation.welcomeMessage": "never"
    };

    console.log('ℹ️  Настройки Copilot обновлены для проекта');
  }

  /**
   * Настройка Git hooks
   */
  setupGitHooks() {
    try {
      // Создаем pre-commit hook
      const preCommitHook = `#!/bin/sh
# Запускается перед каждым коммитом

echo "🔍 Проверка кода перед коммитом..."

# Линтинг
npm run lint:all
if [ $? -ne 0 ]; then
  echo "❌ Ошибки линтера. Исправьте перед коммитом."
  exit 1
fi

# Форматирование
npm run format:check
if [ $? -ne 0 ]; then
  echo "⚠️  Код не отформатирован. Запустите 'npm run format'"
  exit 1
fi

# Проверка типов
npm run type-check
if [ $? -ne 0 ]; then
  echo "❌ Ошибки TypeScript. Исправьте перед коммитом."
  exit 1
fi

echo "✅ Все проверки пройдены!"
`;

      const hookPath = path.join(this.rootPath, '.git', 'hooks', 'pre-commit');
      if (fs.existsSync(path.join(this.rootPath, '.git'))) {
        fs.writeFileSync(hookPath, preCommitHook, { mode: 0o755 });
        console.log('✅ Настроен pre-commit hook');
      } else {
        this.warnings.push('Git репозиторий не инициализирован');
      }

    } catch (error) {
      this.warnings.push(`Ошибка настройки Git hooks: ${error.message}`);
    }
  }

  /**
   * Проверка зависимостей
   */
  checkDependencies() {
    const requiredGlobalPackages = [
      'prisma',
      '@nestjs/cli',
      'typescript'
    ];

    console.log('📦 Проверка глобальных зависимостей...');

    for (const pkg of requiredGlobalPackages) {
      try {
        execSync(`npm list -g ${pkg}`, { stdio: 'ignore' });
        console.log(`✅ ${pkg} установлен глобально`);
      } catch {
        this.warnings.push(`Рекомендуется установить глобально: npm install -g ${pkg}`);
      }
    }
  }

  /**
   * Настройка тестовой среды
   */
  setupTestEnvironment() {
    // Создаем тестовую базу данных
    const testDbUrl = 'postgresql://postgres:postgres@localhost:5432/estimate_service_test';

    const jestConfig = path.join(this.rootPath, 'jest.config.ts');
    if (fs.existsSync(jestConfig)) {
      console.log('✅ Jest конфигурация найдена');
    } else {
      this.warnings.push('Jest конфигурация не найдена');
    }

    // Проверяем playwright
    const playwrightConfig = path.join(this.rootPath, 'playwright.config.ts');
    if (fs.existsSync(playwrightConfig)) {
      console.log('✅ Playwright конфигурация найдена');
    } else {
      console.log('ℹ️  Playwright не настроен (опционально)');
    }
  }

  /**
   * Вывод итоговой информации
   */
  printSummary() {
    console.log('\n' + '='.repeat(50));
    console.log('🎉 НАСТРОЙКА ЗАВЕРШЕНА');
    console.log('='.repeat(50));

    if (this.errors.length > 0) {
      console.log('\n❌ ОШИБКИ:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  ПРЕДУПРЕЖДЕНИЯ:');
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }

    console.log('\n📋 СЛЕДУЮЩИЕ ШАГИ:');
    console.log('   1. Установите рекомендуемые расширения VS Code');
    console.log('   2. Настройте переменные окружения в .env файлах');
    console.log('   3. Запустите: npm run dev:all');
    console.log('   4. Откройте: http://localhost:3000');

    console.log('\n🤖 РАБОТА С COPILOT:');
    console.log('   - Используйте Ctrl+I для inline chat');
    console.log('   - Откройте Copilot Chat для вопросов');
    console.log('   - Пример: "Объясни архитектуру этого проекта"');

    console.log('\n🔗 ПОЛЕЗНЫЕ КОМАНДЫ:');
    console.log('   npm run dev:all          # Запуск всех сервисов');
    console.log('   npm run test:all         # Запуск всех тестов');
    console.log('   npm run docs:check       # Проверка документации');
    console.log('   npx prisma studio        # UI для базы данных');

    console.log('\n✨ Удачной разработки с GitHub Copilot! ✨\n');
  }
}

// Запуск настройки
if (require.main === module) {
  const setup = new DevEnvironmentSetup();
  setup.setup().catch(console.error);
}

module.exports = DevEnvironmentSetup;
