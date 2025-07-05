#!/usr/bin/env node

/**
 * Simple test script for MCP Server with DeepSeek R1
 * Простой тест MCP сервера с DeepSeek R1
 */

// Обработка ошибок записи в stdout (например, при использовании head)
process.stdout.on('error', (error) => {
  if (error.code === 'EPIPE') {
    // Это ожидаемо, когда получатель (как head) закрывает поток раньше времени.
    // Мы просто завершаем процесс без ошибки.
    process.exit(0);
  }
});

// Также обработаем stderr на всякий случай
process.stderr.on('error', (error) => {
  if (error.code === 'EPIPE') {
    process.exit(0);
  }
});

const { spawn } = require('child_process');
const readline = require('readline');

// Test the MCP server
async function testMCPServer() {
  console.log('🧪 Testing MCP Server with DeepSeek R1...\n');

  // Start the MCP server
  const server = spawn('node', ['dist-simple/index-simple.js'], {
    cwd: '/workspaces/estimate-service/mcp-server',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      NODE_ENV: 'development',
      DEEPSEEK_API_KEY: 'sk-aeaf60f610ee429892a113b1f4e20960',
      DEEPSEEK_MODEL: 'deepseek-chat',
      DEEPSEEK_BASE_URL: 'https://api.deepseek.com/v1',
      DEEPSEEK_MAX_TOKENS: '4000',
      DEEPSEEK_TEMPERATURE: '0.3',
      DEEPSEEK_TIMEOUT: '30000',
      DEEPSEEK_MOCK_MODE: 'false',
      PROJECT_ROOT_PATH: '/workspaces/estimate-service',
      LOG_LEVEL: 'debug'
    }
  });

  // Handle server output
  server.stdout.on('data', (data) => {
    console.log('📤 Server Output:', data.toString());
  });

  server.stderr.on('data', (data) => {
    console.error('❌ Server Error:', data.toString());
  });

  // Test list tools
  console.log('📋 Testing list tools...');
  const listToolsRequest = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n';

  server.stdin.write(listToolsRequest);

  // Test health check
  setTimeout(() => {
    console.log('🏥 Testing health check...');
    const healthCheckRequest = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'deepseek_health_check',
        arguments: {}
      }
    }) + '\n';

    server.stdin.write(healthCheckRequest);
  }, 1000);

  // Test code analysis
  setTimeout(() => {
    console.log('🔍 Testing code analysis...');
    const codeAnalysisRequest = JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'deepseek_analyze_code',
        arguments: {
          code: 'function hello(name: string): string { return `Hello, ${name}!`; }',
          language: 'typescript',
          context: 'Simple TypeScript function'
        }
      }
    }) + '\n';

    server.stdin.write(codeAnalysisRequest);
  }, 2000);

  // Clean shutdown
  setTimeout(() => {
    console.log('\n✅ Test completed. Shutting down server...');
    server.kill();
    process.exit(0);
  }, 10000);

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Received SIGINT. Shutting down server...');
    server.kill();
    process.exit(0);
  });
}

// Run the test
testMCPServer().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
