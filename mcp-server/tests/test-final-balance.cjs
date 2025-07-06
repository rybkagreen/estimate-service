#!/usr/bin/env node

/**
 * Финальный тест DeepSeek MCP сервера после пополнения баланса
 */

// Обработка EPIPE ошибки
process.stdout.on('error', err => {
  if (err.code === 'EPIPE') process.exit(0);
});

const { spawn } = require('child_process');

console.log('🎉 Final DeepSeek MCP Server Test\n');

const serverProcess = spawn('node', ['dist-simple/index-simple.js'], {
  stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  env: {
    ...process.env,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    DEEPSEEK_MODEL: 'deepseek-chat',
    DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
    DEEPSEEK_MOCK_MODE: 'false'
  }
});

serverProcess.stdout.on('data', (data) => {
  console.log('📤 Server Output:', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
  console.error('📤 Server Error:', data.toString().trim());
});

// Простой тест - отправляем JSON-RPC запрос через stdin
setTimeout(() => {
  console.log('\n📋 Testing list tools...');

  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  };

  serverProcess.stdin.write(JSON.stringify(listToolsRequest) + '\n');

  setTimeout(() => {
    console.log('\n🏥 Testing health check...');

    const healthCheckRequest = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'deepseek_health_check',
        arguments: {}
      }
    };

    serverProcess.stdin.write(JSON.stringify(healthCheckRequest) + '\n');

    // Завершаем тест через 5 секунд
    setTimeout(() => {
      console.log('\n✅ Test completed. Shutting down server...');
      serverProcess.kill();
      process.exit(0);
    }, 5000);
  }, 2000);
}, 2000);

serverProcess.on('close', (code) => {
  console.log(`\n🏁 Server process exited with code ${code}`);
});
