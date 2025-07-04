import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { logger } from '../utils/logger.js';

// Development tools
import { DockerTool } from './development/docker.js';
import { GitTool } from './development/git.js';
import { LintTool } from './development/lint.js';
import { NpmTool } from './development/npm.js';
import { TestTool } from './development/test.js';

// Project tools
import { BuildTool } from './project/build.js';
import { CodeAnalysisTool } from './project/code-analysis.js';
import { DatabaseTool } from './project/database.js';
import { DocumentationTool } from './project/documentation.js';

// AI tools
import { AIAssistantTool } from './ai/assistant.js';
import { ClassificationTool } from './ai/classification.js';
import { EstimateTool } from './ai/estimate.js';

// External integration tools
import { GrandSmetaTool } from './external/grand-smeta.js';

export interface ToolExecutor {
  execute(args: Record<string, unknown>): Promise<CallToolResult>;
}

class ToolRegistry {
  private tools: Map<string, { tool: Tool; executor: ToolExecutor }> = new Map();

  constructor() {
    this.registerTools();
  }

  private registerTools(): void {
    // Development tools
    this.register(new GitTool());
    this.register(new NpmTool());
    this.register(new DockerTool());
    this.register(new TestTool());
    this.register(new LintTool());

    // Project tools
    this.register(new DocumentationTool());
    this.register(new CodeAnalysisTool());
    this.register(new DatabaseTool());
    this.register(new BuildTool());

    // AI tools
    this.register(new AIAssistantTool());
    this.register(new ClassificationTool());
    this.register(new EstimateTool());

    // External integration tools
    this.register(new GrandSmetaTool());

    logger.info(`Registered ${this.tools.size} tools`);
  }

  private register(toolInstance: ToolExecutor & { getTool(): Tool }): void {
    const tool = toolInstance.getTool();
    this.tools.set(tool.name, {
      tool,
      executor: toolInstance,
    });
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values()).map(({ tool }) => tool);
  }

  async executeTool(name: string, args: Record<string, unknown>): Promise<CallToolResult> {
    const toolEntry = this.tools.get(name);
    if (!toolEntry) {
      throw new Error(`Tool not found: ${name}`);
    }

    try {
      return await toolEntry.executor.execute(args);
    } catch (error) {
      logger.error(`Tool execution failed: ${name}`, { error, args });
      throw error;
    }
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name)?.tool;
  }
}

// Export singleton instance
export const toolRegistry = new ToolRegistry();
