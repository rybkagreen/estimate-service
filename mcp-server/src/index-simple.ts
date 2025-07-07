#!/usr/bin/env node

/**
 * Simple Estimate Service MCP Server with DeepSeek R1
 * Простой MCP сервер с интеграцией DeepSeek R1
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { deepSeekService } from './services/deepseek.service.js';
import { logger } from './utils/logger.js';
import { startMetricsServer } from './utils/metrics-server.js';

/**
 * DeepSeek R1 tools definitions
 */
const DEEPSEEK_TOOLS = [
  {
    name: 'deepseek_analyze_code',
    description: 'Анализ кода с помощью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для анализа' },
        context: { type: 'string', description: 'Контекст анализа' },
        language: { type: 'string', enum: ['typescript', 'javascript', 'react', 'nestjs'], description: 'Язык программирования' }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_generate_docs',
    description: 'Генерация документации с помощью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для документирования' },
        type: { type: 'string', enum: ['function', 'class', 'component', 'api'], description: 'Тип документации' }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_generate_tests',
    description: 'Генерация тестов с помощью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для создания тестов' },
        framework: { type: 'string', enum: ['jest', 'vitest', 'playwright'], description: 'Тестовый фреймворк' },
        testType: { type: 'string', enum: ['unit', 'integration', 'e2e'], description: 'Тип тестов' }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_refactor_code',
    description: 'Рефакторинг кода с помощью DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Код для рефакторинга' },
        goals: { type: 'array', items: { type: 'string' }, description: 'Цели рефакторинга' }
      },
      required: ['code']
    }
  },
  {
    name: 'deepseek_architecture_advice',
    description: 'Архитектурные советы от DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        description: { type: 'string', description: 'Описание задачи' },
        constraints: { type: 'array', items: { type: 'string' }, description: 'Ограничения' },
        domain: { type: 'string', enum: ['frontend', 'backend', 'fullstack', 'database', 'devops'], description: 'Область разработки' }
      },
      required: ['description']
    }
  },
  {
    name: 'deepseek_chat',
    description: 'Общение с DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Сообщение для DeepSeek R1' },
        context: { type: 'string', description: 'Контекст беседы' },
        temperature: { type: 'number', minimum: 0, maximum: 1, description: 'Температура для генерации' }
      },
      required: ['message']
    }
  },
  {
    name: 'deepseek_health_check',
    description: 'Проверка работоспособности DeepSeek R1',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  }
];

/**
 * Frontend integration tools definitions
 */
const FRONTEND_TOOLS = [
  {
    name: 'deepseek_generate_react_component',
    description: 'Generate React components with TypeScript, Tailwind CSS, and tests',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: { type: 'string', description: 'Name of the React component to generate' },
        description: { type: 'string', description: 'Description of component functionality' },
        props: { type: 'array', items: { type: 'string' }, description: 'Component props' },
        styling: { type: 'string', enum: ['tailwind', 'css-modules'], description: 'Styling approach' },
        includeTests: { type: 'boolean', description: 'Include unit tests' }
      },
      required: ['componentName', 'description']
    }
  },
  {
    name: 'deepseek_generate_api_route',
    description: 'Generate API routes for Next.js with validation and documentation',
    inputSchema: {
      type: 'object',
      properties: {
        routePath: { type: 'string', description: 'API route path' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE'], description: 'HTTP method' },
        description: { type: 'string', description: 'API functionality description' },
        framework: { type: 'string', enum: ['nextjs', 'express'], description: 'Backend framework' }
      },
      required: ['routePath', 'description']
    }
  },
  {
    name: 'deepseek_create_ui_design_system',
    description: 'Create design system components with variants and documentation',
    inputSchema: {
      type: 'object',
      properties: {
        componentType: { type: 'string', description: 'Type of UI component' },
        variants: { type: 'array', items: { type: 'string' }, description: 'Component variants' },
        theme: { type: 'string', enum: ['replit', 'material', 'custom'], description: 'Design theme' }
      },
      required: ['componentType']
    }
  },
  {
    name: 'deepseek_optimize_frontend_performance',
    description: 'Optimize frontend code for better Core Web Vitals and performance',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Frontend code to optimize' },
        focusArea: { type: 'string', enum: ['general', 'loading', 'runtime', 'bundle-size'], description: 'Optimization focus' },
        targetMetrics: { type: 'array', items: { type: 'string' }, description: 'Target metrics' }
      },
      required: ['code']
    }
  }
];

/**
 * Tool handlers
 */
async function handleAnalyzeCode(args: any) {
  try {
    const { code, context = '', language = 'typescript' } = args;
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
}

async function handleGenerateDocs(args: any) {
  try {
    const { code, type = 'function' } = args;
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
}

async function handleGenerateTests(args: any) {
  try {
    const { code, framework = 'jest', testType = 'unit' } = args;
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
}

async function handleRefactorCode(args: any) {
  try {
    const { code, goals = [] } = args;
    logger.info(`🔧 Refactoring code with goals: ${goals.join(', ')}`);

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
}

async function handleArchitectureAdvice(args: any) {
  try {
    const { description, constraints = [], domain = 'fullstack' } = args;
    logger.info(`🏗️ Getting architecture advice for ${domain} domain`);

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
          text: `❌ Error getting architecture advice: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

async function handleChat(args: any) {
  try {
    const { message, context = '', temperature = 0.3 } = args;
    logger.info(`💬 Chat with DeepSeek R1: ${message.slice(0, 50)}...`);

    const messages = [
      {
        role: 'system' as const,
        content: context || 'You are an AI assistant helping with software development for the Estimate Service project.'
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
}

async function handleHealthCheck(args: any) {
  try {
    logger.info('🏥 Running DeepSeek R1 health check');
    const result = await deepSeekService.healthCheck();

    return {
      content: [
        {
          type: 'text',
          text: `# 🏥 DeepSeek R1 Health Check\n\n**Status:** ${result.status}\n**Message:** ${result.message}\n${result.latency ? `**Latency:** ${result.latency}ms` : ''}`
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
}

/**
 * Universal handler for frontend tools
 */
async function handleFrontendTool(toolType: string, args: any) {
  try {
    let prompt = '';
    let result = '';

    switch (toolType) {
      case 'generate_react_component':
        const { componentName, description, props = [], styling = 'tailwind', includeTests = true } = args;
        if (!componentName || !description) {
          throw new Error('Component name and description are required');
        }

        logger.info(`🎨 Generating React component: ${componentName}`);

        prompt = `Создай React компонент "${componentName}":
Описание: ${description}
Props: ${props.join(', ') || 'без дополнительных props'}
Стилизация: ${styling}
${includeTests ? 'Включи unit тесты' : ''}

Требования:
- TypeScript с строгой типизацией
- Tailwind CSS классы
- React функциональные компоненты
- Accessibility (a11y)
- JSDoc документация
${includeTests ? '- Unit тесты с React Testing Library' : ''}`;
        break;

      case 'generate_api_route':
        const { routePath, method = 'POST', description: apiDescription, framework = 'nextjs' } = args;
        if (!routePath || !apiDescription) {
          throw new Error('Route path and description are required');
        }

        logger.info(`🔗 Generating API route: ${method} ${routePath}`);

        prompt = `Создай API route для ${framework}:
Путь: ${routePath}
Метод: ${method}
Описание: ${apiDescription}

Требования:
- TypeScript типизация
- Error handling
- Валидация входных данных
- Proper HTTP status codes
- Security best practices`;
        break;

      case 'create_ui_design_system':
        const { componentType = 'button', variants = ['primary', 'secondary'], theme = 'replit' } = args;

        logger.info(`🎨 Creating UI design system: ${componentType}`);

        prompt = `Создай дизайн-систему компонент "${componentType}" в стиле ${theme}:
Варианты: ${variants.join(', ')}

Требования:
- TypeScript интерфейсы
- Tailwind CSS классы
- Accessibility compliance
- Hover, focus, active состояния
- Responsive design
- JSDoc документация`;
        break;

      case 'optimize_frontend_performance':
        const { code, focusArea = 'general', targetMetrics = ['LCP', 'FID', 'CLS'] } = args;
        if (!code) {
          throw new Error('Code is required for performance optimization');
        }

        logger.info(`⚡ Optimizing frontend performance: ${focusArea}`);

        prompt = `Оптимизируй этот код для лучшей производительности:

Фокус: ${focusArea}
Целевые метрики: ${targetMetrics.join(', ')}

\`\`\`typescript
${code}
\`\`\`

Предложи оптимизации с объяснениями:
- Code splitting и lazy loading
- Мемоизация (React.memo, useMemo, useCallback)
- Bundle size optimization
- Image optimization
- Core Web Vitals улучшения`;
        break;

      default:
        throw new Error(`Unknown frontend tool: ${toolType}`);
    }

    const messages = [
      {
        role: 'system' as const,
        content: 'Ты - эксперт фронтенд разработчик для React/TypeScript/Next.js приложений. Создавай production-ready код с лучшими практиками.'
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    result = await deepSeekService.chat(messages, { temperature: 0.3 });

    return {
      content: [
        {
          type: 'text',
          text: `# 🎨 Frontend Tool: ${toolType}\n\n${result}`
        }
      ]
    };
  } catch (error) {
    logger.error(`❌ Frontend tool error (${toolType}):`, error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error in ${toolType}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Main server setup
 */
async function main() {
  // Start metrics server
  startMetricsServer();
  
  const server = new Server(
    {
      name: 'estimate-service-mcp-simple',
      version: '1.0.0',
      description: 'Simple MCP server for Estimate Service with DeepSeek R1 integration',
    }
  );

  // List tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: [...DEEPSEEK_TOOLS, ...FRONTEND_TOOLS] };
  });

  // Call tools
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'deepseek_analyze_code':
        return await handleAnalyzeCode(args);
      case 'deepseek_generate_docs':
        return await handleGenerateDocs(args);
      case 'deepseek_generate_tests':
        return await handleGenerateTests(args);
      case 'deepseek_refactor_code':
        return await handleRefactorCode(args);
      case 'deepseek_architecture_advice':
        return await handleArchitectureAdvice(args);
      case 'deepseek_chat':
        return await handleChat(args);
      case 'deepseek_health_check':
        return await handleHealthCheck(args);

      // Frontend integration tools
      case 'deepseek_generate_react_component':
        return await handleFrontendTool('generate_react_component', args);
      case 'deepseek_generate_api_route':
        return await handleFrontendTool('generate_api_route', args);
      case 'deepseek_create_ui_design_system':
        return await handleFrontendTool('create_ui_design_system', args);
      case 'deepseek_optimize_frontend_performance':
        return await handleFrontendTool('optimize_frontend_performance', args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info('🚀 Simple Estimate Service MCP Server with DeepSeek R1 started successfully');
  const allTools = [...DEEPSEEK_TOOLS, ...FRONTEND_TOOLS];
  logger.info(`📋 Available tools (${allTools.length}): ${allTools.map(t => t.name).join(', ')}`);
}

main().catch((error) => {
  logger.error('❌ MCP Server failed to start:', error);
  process.exit(1);
});
