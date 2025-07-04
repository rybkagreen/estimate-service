import { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { execSync } from 'child_process';
import { z } from 'zod';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';
import { ToolExecutor } from '../index.js';

const GitArgsSchema = z.object({
  command: z.enum(['status', 'log', 'diff', 'branch', 'commit', 'push', 'pull', 'add', 'reset']),
  args: z.array(z.string()).optional(),
  message: z.string().optional(), // For commit command
  files: z.array(z.string()).optional(), // For add command
});

export class GitTool implements ToolExecutor {
  getTool(): Tool {
    return {
      name: 'git',
      description: 'Execute Git commands for version control operations',
      inputSchema: {
        type: 'object',
        properties: {
          command: {
            type: 'string',
            enum: ['status', 'log', 'diff', 'branch', 'commit', 'push', 'pull', 'add', 'reset'],
            description: 'Git command to execute',
          },
          args: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional arguments for the git command',
          },
          message: {
            type: 'string',
            description: 'Commit message (for commit command)',
          },
          files: {
            type: 'array',
            items: { type: 'string' },
            description: 'Files to add (for add command)',
          },
        },
        required: ['command'],
      },
    };
  }

  async execute(args: Record<string, unknown>): Promise<CallToolResult> {
    const { command, args: cmdArgs, message, files } = GitArgsSchema.parse(args);

    try {
      const result = await this.executeGitCommand(command, cmdArgs, message, files);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              command: `git ${command}`,
              success: true,
              output: result,
            }, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      logger.error('Git command failed', { command, error });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              command: `git ${command}`,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  }

  private async executeGitCommand(
    command: string,
    args?: string[],
    message?: string,
    files?: string[]
  ): Promise<string> {
    const cwd = config.project.rootPath;

    let gitCommand = `git ${command}`;

    // Handle specific commands
    switch (command) {
      case 'commit':
        if (!message) {
          throw new Error('Commit message is required');
        }
        gitCommand = `git commit -m "${message}"`;
        break;

      case 'add':
        if (files && files.length > 0) {
          gitCommand = `git add ${files.join(' ')}`;
        } else {
          gitCommand = 'git add .';
        }
        break;

      case 'log':
        gitCommand = 'git log --oneline -10'; // Default to last 10 commits
        break;

      case 'status':
        gitCommand = 'git status --porcelain';
        break;

      case 'diff':
        gitCommand = 'git diff --name-status';
        break;
    }

    // Add additional args if provided
    if (args && args.length > 0) {
      gitCommand += ` ${args.join(' ')}`;
    }

    logger.info(`Executing git command: ${gitCommand}`, { cwd });

    return execSync(gitCommand, {
      cwd,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024, // 1MB buffer
    });
  }
}
