import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import { z } from 'zod';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ToolExecutor } from '../index.js';

const NpmArgsSchema = z.object({
  command: z.enum(['install', 'update', 'test', 'build', 'start', 'dev', 'lint', 'format', 'audit']),
  packages: z.array(z.string()).optional(),
  flags: z.array(z.string()).optional(),
  script: z.string().optional(),
});

export class NpmTool implements ToolExecutor {
  getTool(): Tool {
    return {
      name: 'npm',
      description: 'Execute NPM commands for package management and scripts',
      inputSchema: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            enum: ['install', 'update', 'test', 'build', 'start', 'dev', 'lint', 'format', 'audit'],
            description: 'NPM command to execute',
          },
          packages: {
            type: 'array',
            items: { type: 'string' },
            description: 'Package names (for install/update)',
          },
          flags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional flags for the command',
          },
          script: {
            type: 'string',
            description: 'Custom script name to run',
          },
        },
        required: ['command'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { command, packages, flags, script } = NpmArgsSchema.parse(args);

    try {
      const result = await this.executeNpmCommand(command, packages, flags, script);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              command: this.buildNpmCommand(command, packages, flags, script),
              success: true,
              output: result,
            }, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      logger.error('NPM command failed', { command, error });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              command: this.buildNpmCommand(command, packages, flags, script),
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  private buildNpmCommand(
    command: string,
    packages?: string[],
    flags?: string[],
    script?: string
  ): string {
    let npmCommand = 'npm';

    // Handle script commands
    if (['test', 'build', 'start', 'dev', 'lint', 'format'].includes(command)) {
      npmCommand = `npm run ${command}`;
    } else if (script) {
      npmCommand = `npm run ${script}`;
    } else {
      npmCommand = `npm ${command}`;
    }

    // Add packages
    if (packages && packages.length > 0) {
      npmCommand += ` ${packages.join(' ')}`;
    }

    // Add flags
    if (flags && flags.length > 0) {
      npmCommand += ` ${flags.join(' ')}`;
    }

    return npmCommand;
  }

  private async executeNpmCommand(
    command: string,
    packages?: string[],
    flags?: string[],
    script?: string
  ): Promise<string> {
    const cwd = config.project.rootPath;
    const npmCommand = this.buildNpmCommand(command, packages, flags, script);

    logger.info(`Executing npm command: ${npmCommand}`, { cwd });

    return execSync(npmCommand, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 5, // 5MB buffer for large outputs
    });
  }
}
