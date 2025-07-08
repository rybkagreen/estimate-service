#!/usr/bin/env node

/**
 * Тестирование локальной модели DeepSeek R1
 */

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Тестирование локальной модели DeepSeek R1...\n');

// Тестовые запросы
const testRequests = [
  {
    name: 'Проверка статуса',
    tool: 'local_deepseek_health_check',
    args: {}
  },
  {
    name: 'Простой чат',
    tool: 'local_deepseek_chat',
    args: {
      message: 'Привет! Ты можешь помочь с анализом кода?'
    }
  },
  {
    name: 'Анализ кода',
    tool: 'local_deepseek_chat',
    args: {
      message: 'Сделай анализ этого TypeScript кода',
      context: 'React компонент для отображения списка элементов'
    }
  },
  {
    name: 'Генерация тестов',
    tool: 'local_deepseek_chat',
    args: {
      message: 'Создай unit тесты для функции валидации формы'
    }
  }
];

async function testMCPServer() {
  const serverPath = join(__dirname, 'dist-simple', 'index-local-simple.js');

  console.log(`📂 Путь к серверу: ${serverPath}`);
  console.log('🚀 Запуск MCP сервера...\n');

  // Запуск сервера
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'development',
      LOG_LEVEL: 'info'
    }
  });

  let serverReady = false;
  let testIndex = 0;

  // Обработка вывода сервера
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('📤 Сервер:', output.trim());

    if (output.includes('MCP сервер готов') && !serverReady) {
      serverReady = true;
      console.log('\n✅ Сервер готов к тестированию!\n');
      runNextTest();
    }
  });

  server.stderr.on('data', (data) => {
    console.error('❌ Ошибка сервера:', data.toString().trim());
  });

  // Функция запуска следующего теста
  function runNextTest() {
    if (testIndex >= testRequests.length) {
      console.log('\n🎉 Все тесты завершены!');
      server.kill();
      return;
    }

    const test = testRequests[testIndex++];
    console.log(`🔧 Тест ${testIndex}: ${test.name}`);

    // Создание MCP запроса
    const request = {
      jsonrpc: '2.0',
      id: testIndex,
      method: 'tools/call',
      params: {
        name: test.tool,
        arguments: test.args
      }
    };

    // Отправка запроса
    server.stdin.write(JSON.stringify(request) + '\n');

    // Ждем ответ и запускаем следующий тест
    setTimeout(runNextTest, 2000);
  }

  // Обработка завершения
  server.on('close', (code) => {
    console.log(`\n🏁 MCP сервер завершен с кодом: ${code}`);
    process.exit(code || 0);
  });

  server.on('error', (error) => {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  });

  // Инициализация MCP
  setTimeout(() => {
    console.log('📡 Инициализация MCP соединения...');

    const initRequest = {
      jsonrpc: '2.0',
      id: 0,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'test-client',
          version: '1.0.0'
        }
      }
    };

    server.stdin.write(JSON.stringify(initRequest) + '\n');
  }, 1000);
}

// Обработка Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Тестирование прервано');
  process.exit(0);
});

// Запуск тестов
testMCPServer().catch(error => {
  console.error('❌ Ошибка тестирования:', error);
  process.exit(1);
});
