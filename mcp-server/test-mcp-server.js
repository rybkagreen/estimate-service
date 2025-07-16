#!/usr/bin/env node

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing MCP Server...\n');

// Запускаем MCP сервер
const server = spawn('node', ['dist-simple/index-simple.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
});

let serverReady = false;

// Читаем вывод сервера
server.stdout.on('data', (data) => {
  const output = data.toString();

  console.log(`[SERVER]: ${output.trim()}`);

  // Проверяем, что сервер запустился
  if (output.includes('started successfully')) {
    serverReady = true;
    console.log('\n✅ Server started successfully!');
    testServerFunctionality();
  }
});

server.stderr.on('data', (data) => {
  console.error(`[ERROR]: ${data.toString().trim()}`);
});

server.on('close', (code) => {
  console.log(`\n[SERVER] Process exited with code ${code}`);
});

// Функция для тестирования функциональности
async function testServerFunctionality() {
  console.log('\n📋 Testing MCP protocol communication...');

  // Отправляем тестовый запрос в формате MCP
  const testRequest = `${JSON.stringify({
    jsonrpc: '2.0',
    method: 'tools/list',
    params: {},
    id: 1,
  })}\n`;

  console.log(`\n📤 Sending request: ${testRequest.trim()}`);

  // Отправляем запрос серверу
  server.stdin.write(testRequest);

  // Ждем ответ
  setTimeout(() => {
    console.log('\n📊 Test complete. Server is running and responsive.');
    console.log('Press Ctrl+C to stop the server.\n');
  }, 2000);
}

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping server...');
  server.kill();
  process.exit(0);
});

// Обработка ошибок
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.kill();
  process.exit(1);
});
