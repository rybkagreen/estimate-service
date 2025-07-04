import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

export abstract class BaseTool {
  abstract getTool(): Tool;
  abstract execute(args: Record<string, unknown>): Promise<CallToolResult>;

  protected async executeCommand(
    command: string,
    cwd: string = config.project.rootPath,
    options: { maxBuffer?: number; timeout?: number } = {}
  ): Promise<string> {
    logger.info(`Executing command: ${command}`, { cwd });

    return execSync(command, {
      cwd,
      encoding: 'utf8',
      maxBuffer: options.maxBuffer || 1024 * 1024, // 1MB default
      timeout: options.timeout || 30000, // 30s default
      ...options,
    });
  }

  protected createSuccessResult(command: string, output: string): CallToolResult {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            command,
            success: true,
            output,
          }, null, 2),
        },
      ],
      isError: false,
    };
  }

  protected createErrorResult(command: string, error: unknown): CallToolResult {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            command,
            success: false,
            error: errorMessage,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
}
