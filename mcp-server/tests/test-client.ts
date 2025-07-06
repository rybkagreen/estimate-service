#!/usr/bin/env node

/**
 * Simple MCP client for testing the Estimate Service MCP server
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

class MCPTestClient {
  private client: Client;
  private serverProcess: any;

  constructor() {
    this.client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });
  }

  async startServerAndConnect() {
    console.log('Starting MCP server...');

    // Start the server process
    this.serverProcess = spawn('node', ['dist/index.js'], {
      cwd: process.cwd(),
      stdio: 'pipe',
    });

    // Connect client to server
    const transport = new StdioClientTransport({
      spawn: () => this.serverProcess,
    });

    await this.client.connect(transport);
    console.log('Connected to MCP server');
  }

  async testListTools() {
    console.log('\\nListing available tools...');
    try {
      const response = await this.client.request(
        {
          method: 'tools/list',
        },
        {}
      );

      console.log('Available tools:');
      response.tools.forEach((tool: any) => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });

      return response.tools;
    } catch (error) {
      console.error('Error listing tools:', error);
      return [];
    }
  }

  async testEchoTool() {
    console.log('\\nTesting echo tool...');
    try {
      const response = await this.client.request(
        {
          method: 'tools/call',
        },
        {
          name: 'echo',
          arguments: {
            text: 'Hello from MCP test client!',
          },
        }
      );

      console.log('Echo response:', response.content[0].text);
      return response;
    } catch (error) {
      console.error('Error calling echo tool:', error);
      return null;
    }
  }

  async cleanup() {
    console.log('\\nCleaning up...');
    if (this.client) {
      await this.client.close();
    }
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

async function main() {
  const testClient = new MCPTestClient();

  try {
    await testClient.startServerAndConnect();
    await testClient.testListTools();
    await testClient.testEchoTool();
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await testClient.cleanup();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
