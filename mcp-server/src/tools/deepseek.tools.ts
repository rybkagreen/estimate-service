/**
 * DeepSeek R1 MCP Tools
 * Инструменты для интеграции с DeepSeek R1 в MCP сервере
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { deepSeekService } from '../services/deepseek.service.js';
import { logger } from '../utils/logger.js';

const CodeAnalysisSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  context: z.string().optional().default(''),
  language: z.enum(['typescript', 'javascript', 'react', 'nestjs']).optional().default('typescript'),
});

const DocumentationSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  type: z.enum(['function', 'class', 'component', 'api']).optional().default('function'),
});

const TestGenerationSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  framework: z.enum(['jest', 'vitest', 'playwright']).optional().default('jest'),
  testType: z.enum(['unit', 'integration', 'e2e']).optional().default('unit'),
});

const RefactorSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  goals: z.array(z.string()).optional().default([]),
});

const ArchitectureSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  constraints: z.array(z.string()).optional().default([]),
  domain: z.enum(['frontend', 'backend', 'fullstack', 'database', 'devops']).optional().default('fullstack'),
});

const ChatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  context: z.string().optional().default(''),
  temperature: z.number().min(0).max(1).optional().default(0.3),
});

/**
 * Настройка инструментов DeepSeek R1 для MCP сервера
 */
export function setupDeepSeekTools(server: Server): void {
  // Анализ кода
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== 'deepseek_analyze_code') return;
    try {
      const { code, context, language } = request.params.arguments;

      logger.info(`🔍 Analyzing ${language} code (${code.length} chars)`);

      const fullContext = context || `Analyzing ${language} code for the Estimate Service project`;
      const analysis = await deepSeekService.analyzeCode(code, fullContext);

      return {
        content: [
          {
            type: 'text',
            text: `# 🔍 Code Analysis Results\n\n${analysis}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Code analysis error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error analyzing code: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  // Генерация документации
  server.setRequestHandler({
    method: 'tools/call',
    schema: z.object({
      name: z.literal('deepseek_generate_docs'),
      arguments: DocumentationSchema,
    }),
  }, async (request) => {
    try {
      const { code, type } = request.params.arguments;

      logger.info(`📚 Generating documentation for ${type}`);

      const documentation = await deepSeekService.generateDocumentation(code, type);

      return {
        content: [
          {
            type: 'text',
            text: `# 📚 Generated Documentation\n\n${documentation}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Documentation generation error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error generating documentation: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  // Генерация тестов
  server.setRequestHandler({
    method: 'tools/call',
    schema: z.object({
      name: z.literal('deepseek_generate_tests'),
      arguments: TestGenerationSchema,
    }),
  }, async (request) => {
    try {
      const { code, framework, testType } = request.params.arguments;

      logger.info(`🧪 Generating ${testType} tests with ${framework}`);

      const tests = await deepSeekService.generateTests(code, framework);

      return {
        content: [
          {
            type: 'text',
            text: `# 🧪 Generated Tests (${framework})\n\n${tests}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Test generation error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error generating tests: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  // Рефакторинг кода
  server.setRequestHandler({
    method: 'tools/call',
    schema: z.object({
      name: z.literal('deepseek_refactor_code'),
      arguments: RefactorSchema,
    }),
  }, async (request) => {
    try {
      const { code, goals } = request.params.arguments;

      logger.info(`🔧 Refactoring code with goals: ${goals.join(', ') || 'general improvements'}`);

      const refactoredCode = await deepSeekService.refactorCode(code, goals);

      return {
        content: [
          {
            type: 'text',
            text: `# 🔧 Refactored Code\n\n${refactoredCode}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Code refactoring error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error refactoring code: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  // Архитектурные советы
  server.setRequestHandler({
    method: 'tools/call',
    schema: z.object({
      name: z.literal('deepseek_architecture_advice'),
      arguments: ArchitectureSchema,
    }),
  }, async (request) => {
    try {
      const { description, constraints, domain } = request.params.arguments;

      logger.info(`🏗️ Providing architecture advice for ${domain} domain`);

      const advice = await deepSeekService.architectureAdvice(description, constraints);

      return {
        content: [
          {
            type: 'text',
            text: `# 🏗️ Architecture Advice\n\n${advice}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Architecture advice error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error providing architecture advice: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  // Общий чат с DeepSeek R1
  server.setRequestHandler({
    method: 'tools/call',
    schema: z.object({
      name: z.literal('deepseek_chat'),
      arguments: ChatSchema,
    }),
  }, async (request) => {
    try {
      const { message, context, temperature } = request.params.arguments;

      logger.info(`💬 DeepSeek chat: ${message.substring(0, 50)}...`);

      const messages = [
        {
          role: 'system' as const,
          content: `Ты - ИИ-ассистент для разработки Estimate Service.
Помогаешь с React, TypeScript, NestJS, Prisma, PostgreSQL разработкой.
${context ? `\nКонтекст: ${context}` : ''}`
        },
        {
          role: 'user' as const,
          content: message
        }
      ];

      const response = await deepSeekService.chat(messages, { temperature });

      return {
        content: [
          {
            type: 'text',
            text: `# 💬 DeepSeek R1 Response\n\n${response}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Chat error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Error in chat: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  // Health check для DeepSeek API
  server.setRequestHandler({
    method: 'tools/call',
    schema: z.object({
      name: z.literal('deepseek_health_check'),
      arguments: z.object({}),
    }),
  }, async () => {
    try {
      logger.info('🏥 Checking DeepSeek API health');

      const health = await deepSeekService.healthCheck();

      const statusEmoji = health.status === 'ok' ? '✅' : '❌';
      const latencyText = health.latency ? ` (${health.latency}ms)` : '';

      return {
        content: [
          {
            type: 'text',
            text: `# 🏥 DeepSeek API Health Check\n\n${statusEmoji} **Status**: ${health.status}${latencyText}\n\n**Message**: ${health.message}`
          }
        ]
      };
    } catch (error) {
      logger.error('❌ Health check error:', error);
      return {
        content: [
          {
            type: 'text',
            text: `❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  });

  logger.info('🤖 DeepSeek R1 tools registered successfully');
}

/**
 * Список доступных DeepSeek инструментов
 */
export const deepSeekToolsList = [
  {
    name: 'deepseek_analyze_code',
    description: 'Analyze code quality, architecture, and suggest improvements using DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to analyze'
        },
        context: {
          type: 'string',
          description: 'Additional context about the code'
        },
        language: {
          type: 'string',
          enum: ['typescript', 'javascript', 'react', 'nestjs'],
          description: 'Programming language/framework'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_generate_docs',
    description: 'Generate comprehensive documentation for code using DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to document'
        },
        type: {
          type: 'string',
          enum: ['function', 'class', 'component', 'api'],
          description: 'Type of code element'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_generate_tests',
    description: 'Generate comprehensive tests for code using DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to test'
        },
        framework: {
          type: 'string',
          enum: ['jest', 'vitest', 'playwright'],
          description: 'Testing framework to use'
        },
        testType: {
          type: 'string',
          enum: ['unit', 'integration', 'e2e'],
          description: 'Type of tests to generate'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_refactor_code',
    description: 'Refactor and improve code quality using DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The code to refactor'
        },
        goals: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Refactoring goals (e.g., performance, readability, SOLID principles)'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_architecture_advice',
    description: 'Get architecture recommendations using DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        description: {
          type: 'string',
          description: 'Description of the architecture challenge or requirement'
        },
        constraints: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Technical or business constraints'
        },
        domain: {
          type: 'string',
          enum: ['frontend', 'backend', 'fullstack', 'database', 'devops'],
          description: 'Domain area for advice'
        }
      },
      required: ['description']
    }
  },
  {
    name: 'deepseek_chat',
    description: 'Chat with DeepSeek R1 AI assistant for development help',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Your message or question'
        },
        context: {
          type: 'string',
          description: 'Additional context for the conversation'
        },
        temperature: {
          type: 'number',
          minimum: 0,
          maximum: 1,
          description: 'Response creativity level (0 = focused, 1 = creative)'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'deepseek_health_check',
    description: 'Check DeepSeek R1 API connectivity and status',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];
