import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing MCP Server with Protocol Messages...\n');

// Path to the compiled server
const serverPath = join(__dirname, 'dist-simple', 'index-local-simple-fixed.js');

console.log(`📍 Server path: ${serverPath}`);
console.log('🚀 Starting MCP server...\n');

// Spawn the server process
const server = spawn('node', [serverPath], {
  env: {
    ...process.env,
    LOG_LEVEL: 'info',
    NODE_ENV: 'development',
  },
  stdio: ['pipe', 'pipe', 'inherit'],
});

// Buffer for accumulating response data
let responseBuffer = '';

// Handle server output
server.stdout.on('data', (data) => {
  responseBuffer += data.toString();

  // Try to parse complete JSON messages
  const lines = responseBuffer.split('\n');

  responseBuffer = lines.pop() || ''; // Keep incomplete line in buffer

  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);

        console.log('📥 Received:', JSON.stringify(response, null, 2));
      } catch (e) {
        console.log('📄 Raw output:', line);
      }
    }
  });
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`\n✅ Server process exited with code ${code}`);
  process.exit(code || 0);
});

// Send MCP protocol messages
async function sendMessage(message) {
  console.log('📤 Sending:', JSON.stringify(message, null, 2));
  server.stdin.write(`${JSON.stringify(message)}\n`);
}

// Test sequence
async function runTests() {
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 1. Initialize
  await sendMessage({
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0',
      },
    },
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // 2. List tools
  await sendMessage({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {},
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // 3. Call health check tool
  await sendMessage({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'local_deepseek_health_check',
      arguments: {},
    },
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. Call chat tool
  await sendMessage({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'local_deepseek_chat',
      arguments: {
        message: 'Привет! Как работает MCP сервер?',
        context: 'Тестирование локальной модели',
      },
    },
  });

  // Wait for responses and then close
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('\n🛑 Closing server...');
  server.kill();
}

// Run the tests
runTests().catch(console.error);
