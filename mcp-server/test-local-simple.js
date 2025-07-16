import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing MCP Server Local Simple...\n');

// Path to the compiled server
const serverPath = join(__dirname, 'dist-simple', 'index-local-simple.js');

console.log(`📍 Server path: ${serverPath}`);
console.log('🚀 Starting server...\n');

// Spawn the server process
const server = spawn('node', [serverPath], {
  env: {
    ...process.env,
    LOG_LEVEL: 'debug',
    NODE_ENV: 'development',
  },
  stdio: ['pipe', 'pipe', 'pipe'],
});

// Handle server output
server.stdout.on('data', (data) => {
  console.log(`[SERVER STDOUT]: ${data.toString()}`);
});

server.stderr.on('data', (data) => {
  console.error(`[SERVER STDERR]: ${data.toString()}`);
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
});

server.on('close', (code) => {
  console.log(`\n✅ Server process exited with code ${code}`);
});

// Send a test message after 2 seconds
setTimeout(() => {
  console.log('\n📤 Sending test request...');

  const testRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  };

  server.stdin.write(`${JSON.stringify(testRequest)}\n`);
}, 2000);

// Close after 5 seconds
setTimeout(() => {
  console.log('\n🛑 Closing server...');
  server.kill();
  process.exit(0);
}, 5000);
