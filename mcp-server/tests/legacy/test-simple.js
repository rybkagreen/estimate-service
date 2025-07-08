#!/usr/bin/env node

/**
 * Simple test for MCP server using manual JSON-RPC messages
 */

const { spawn } = require('child_process');
const path = require('path');

function testMCPServer() {
  console.log('Testing MCP Server...');

  const serverPath = path.join(__dirname, 'dist', 'index.js');
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  let requestId = 1;

  function sendRequest(method, params = {}) {
    const request = {
      jsonrpc: '2.0',
      id: requestId++,
      method,
      params
    };

    const message = JSON.stringify(request) + '\\n';
    console.log('Sending:', message.trim());
    server.stdin.write(message);
  }

  server.stdout.on('data', (data) => {
    const response = data.toString().trim();
    console.log('Received:', response);
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  // Initialize handshake
  setTimeout(() => {
    sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });
  }, 100);

  // List tools
  setTimeout(() => {
    sendRequest('tools/list');
  }, 500);

  // Test echo tool
  setTimeout(() => {
    sendRequest('tools/call', {
      name: 'echo',
      arguments: {
        text: 'Hello from test!'
      }
    });
  }, 1000);

  // Cleanup
  setTimeout(() => {
    server.kill();
    console.log('Test completed');
  }, 2000);
}

testMCPServer();
