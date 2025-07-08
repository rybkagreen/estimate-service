#!/usr/bin/env node

/**
 * Estimate Service MCP Server
 *
 * Model Context Protocol server for comprehensive development support
 * of the Estimate Service project.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { resourceRegistry } from './resources/index.js';
import { initializeServices } from './services/index.js';
import { toolRegistry } from './tools/index.js';
import { logger } from './utils/logger.js';

class EstimateServiceMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server({
      name: 'estimate-service-mcp',
      version: '1.0.0',
    });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      logger.info('Listing available tools');
      return {
        tools: toolRegistry.getAllTools(),
      };
    });

    // Execute tool
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info(`Executing tool: ${name}`, { args });

      try {
        const result = await toolRegistry.executeTool(name, args || {});
        return result;
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, { error });
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });

    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      logger.info('Listing available resources');
      return {
        resources: resourceRegistry.getAllResources(),
      };
    });

    // Read resource
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      logger.info(`Reading resource: ${uri}`);

      try {
        const content = await resourceRegistry.readResource(uri);
        return {
          contents: [content],
        };
      } catch (error) {
        logger.error(`Resource read failed: ${uri}`, { error });
        throw new McpError(
          ErrorCode.InternalError,
          `Resource read failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  async start(): Promise<void> {
    try {
      // Initialize services
      await initializeServices();

      // Create transport
      const transport = new StdioServerTransport();

      // Connect server to transport
      await this.server.connect(transport);

      logger.info('Estimate Service MCP Server started successfully');

      // Handle graceful shutdown
      process.on('SIGINT', () => this.shutdown());
      process.on('SIGTERM', () => this.shutdown());

    } catch (error) {
      logger.error('Failed to start MCP server', { error });
      process.exit(1);
    }
  }

  private async shutdown(): Promise<void> {
    logger.info('Shutting down MCP server...');
    await this.server.close();
    process.exit(0);
  }
}

// Start the server
const server = new EstimateServiceMCPServer();
server.start().catch((error) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
