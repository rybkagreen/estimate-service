/**
 * DeepSeek R1 Frontend Integration Tools
 * Инструменты для интеграции MCP сервера с frontend приложением
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { deepSeekService } from '../services/deepseek.service.js';
import { logger } from '../utils/logger.js';

/**
 * Настройка инструментов интеграции frontend с DeepSeek R1
 */
export function setupFrontendIntegrationTools(server: Server): void {
  // Frontend component generation
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'deepseek_generate_react_component':
        return await handleGenerateReactComponent(args);

      case 'deepseek_generate_api_route':
        return await handleGenerateApiRoute(args);

      case 'deepseek_create_ui_design_system':
        return await handleCreateUIDesignSystem(args);

      case 'deepseek_optimize_frontend_performance':
        return await handleOptimizeFrontendPerformance(args);

      default:
        // Not a frontend integration tool
        return;
    }
  });

  logger.info('🎨 Frontend integration tools registered successfully');
}

async function handleGenerateReactComponent(args: any) {
  try {
    const {
      componentName,
      description,
      props = [],
      styling = 'tailwind',
      includeTests = true
    } = args;

    if (!componentName || !description) {
      throw new Error('Component name and description are required');
    }

    logger.info(`🎨 Generating React component: ${componentName}`);

    const messages = [
      {
        role: 'system' as const,
        content: `Ты - React эксперт для Estimate Service. Создавай современные, типизированные компоненты.

Требования:
- TypeScript с строгой типизацией
- ${styling === 'tailwind' ? 'Tailwind CSS' : 'CSS Modules'} для стилизации
- React функциональные компоненты с хуками
- Accessibility (a11y) best practices
- Responsive design
- JSDoc документация
${includeTests ? '- Unit тесты с React Testing Library' : ''}

Стиль кода:
- Современный React (2024)
- Используй Replit UI Design System принципы
- Clean, читаемый код
- Proper TypeScript interfaces`
      },
      {
        role: 'user' as const,
        content: `Создай React компонент "${componentName}" со следующими требованиями:

Описание: ${description}

${props.length > 0 ? `Props: ${props.join(', ')}` : 'Без дополнительных props'}

Стилизация: ${styling}
${includeTests ? 'Включи unit тесты' : ''}

Создай полную реализацию с интерфейсами, компонентом и ${includeTests ? 'тестами' : 'примерами использования'}.`
      }
    ];

    const component = await deepSeekService.chat(messages, { temperature: 0.3 });

    return {
      content: [
        {
          type: 'text',
          text: `# 🎨 Generated React Component: ${componentName}\n\n${component}`
        }
      ]
    };
  } catch (error) {
    logger.error('❌ React component generation error:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error generating React component: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

async function handleGenerateApiRoute(args: any) {
  try {
    const {
      routePath,
      method = 'POST',
      description,
      framework = 'nextjs',
      includeValidation = true,
      includeAuth = false
    } = args;

    if (!routePath || !description) {
      throw new Error('Route path and description are required');
    }

    logger.info(`🔗 Generating API route: ${method} ${routePath}`);

    const messages = [
      {
        role: 'system' as const,
        content: `Ты - эксперт по API разработке для ${framework}. Создавай production-ready эндпоинты.

Требования:
- TypeScript с строгой типизацией
- Proper error handling и status codes
- Request/Response validation с Zod
- Structured logging
- RESTful принципы
${includeAuth ? '- JWT authentication middleware' : ''}
- OpenAPI/Swagger документация в комментариях

Стиль кода:
- Современные async/await паттерны
- Comprehensive error handling
- Input validation и sanitization
- Proper HTTP status codes
- Security best practices`
      },
      {
        role: 'user' as const,
        content: `Создай API route для ${framework}:

Путь: ${routePath}
Метод: ${method}
Описание: ${description}

Требования:
${includeValidation ? '- Включи валидацию входных данных' : ''}
${includeAuth ? '- Добавь аутентификацию' : ''}
- Error handling
- TypeScript типы
- Swagger документация

Создай полную реализацию с интерфейсами, валидацией и примерами использования.`
      }
    ];

    const apiRoute = await deepSeekService.chat(messages, { temperature: 0.2 });

    return {
      content: [
        {
          type: 'text',
          text: `# 🔗 Generated API Route: ${method} ${routePath}\n\n${apiRoute}`
        }
      ]
    };
  } catch (error) {
    logger.error('❌ API route generation error:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error generating API route: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

async function handleCreateUIDesignSystem(args: any) {
  try {
    const {
      componentType = 'button',
      variants = ['primary', 'secondary'],
      theme = 'replit',
      includeStorybook = true
    } = args;

    logger.info(`🎨 Creating UI design system component: ${componentType}`);

    const messages = [
      {
        role: 'system' as const,
        content: `Ты - UI/UX дизайнер и фронтенд эксперт для создания дизайн-системы в стиле ${theme}.

Создавай:
- Реиспользуемые компоненты с вариантами
- Consistent color palette и typography
- Accessibility compliance (WCAG 2.1)
- Responsive behavior
- Hover, focus, active состояния
- TypeScript интерфейсы для всех props
${includeStorybook ? '- Storybook stories для документации' : ''}

Стиль ${theme}:
- Minimalist и clean дизайн
- Subtle shadows и borders
- Modern color scheme
- Excellent UX patterns`
      },
      {
        role: 'user' as const,
        content: `Создай дизайн-систему компонент "${componentType}" в стиле ${theme}:

Варианты: ${variants.join(', ')}
${includeStorybook ? 'Включи Storybook stories' : ''}

Создай:
1. TypeScript интерфейсы и типы
2. Основной компонент с всеми вариантами
3. Tailwind CSS классы и стили
4. Accessibility features
5. ${includeStorybook ? 'Storybook stories' : 'Примеры использования'}
6. JSDoc документацию`
      }
    ];

    const designSystem = await deepSeekService.chat(messages, { temperature: 0.4 });

    return {
      content: [
        {
          type: 'text',
          text: `# 🎨 UI Design System Component: ${componentType}\n\n${designSystem}`
        }
      ]
    };
  } catch (error) {
    logger.error('❌ UI design system error:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error creating UI design system: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

async function handleOptimizeFrontendPerformance(args: any) {
  try {
    const {
      code,
      focusArea = 'general',
      targetMetrics = ['LCP', 'FID', 'CLS'],
      bundleAnalysis = false
    } = args;

    if (!code) {
      throw new Error('Code is required for performance optimization');
    }

    logger.info(`⚡ Optimizing frontend performance: ${focusArea}`);

    const messages = [
      {
        role: 'system' as const,
        content: `Ты - эксперт по производительности фронтенда. Оптимизируй код для лучших Core Web Vitals.

Фокус области: ${focusArea}
Target метрики: ${targetMetrics.join(', ')}

Оптимизации:
- Code splitting и lazy loading
- Мемоизация (React.memo, useMemo, useCallback)
- Bundle size optimization
- Image optimization
- Critical CSS extraction
- Preloading и prefetching
- Web Workers для heavy tasks
- Service Workers для кэширования
${bundleAnalysis ? '- Bundle analyzer recommendations' : ''}

Предоставляй:
- Конкретные изменения кода
- Объяснения почему каждая оптимизация важна
- Метрики до/после
- Monitoring рекомендации`
      },
      {
        role: 'user' as const,
        content: `Оптимизируй этот код для лучшей производительности:

Фокус: ${focusArea}
Целевые метрики: ${targetMetrics.join(', ')}
${bundleAnalysis ? 'Включи анализ бандла' : ''}

\`\`\`typescript
${code}
\`\`\`

Предложи оптимизации с объяснениями и примерами измерения производительности.`
      }
    ];

    const optimization = await deepSeekService.chat(messages, { temperature: 0.2 });

    return {
      content: [
        {
          type: 'text',
          text: `# ⚡ Frontend Performance Optimization\n\n${optimization}`
        }
      ]
    };
  } catch (error) {
    logger.error('❌ Performance optimization error:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error optimizing performance: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Список инструментов интеграции frontend
 */
export const frontendIntegrationToolsList = [
  {
    name: 'deepseek_generate_react_component',
    description: 'Generate React components with TypeScript, Tailwind CSS, and tests',
    inputSchema: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the React component to generate'
        },
        description: {
          type: 'string',
          description: 'Description of component functionality and requirements'
        },
        props: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of component props'
        },
        styling: {
          type: 'string',
          enum: ['tailwind', 'css-modules'],
          description: 'Styling approach to use'
        },
        includeTests: {
          type: 'boolean',
          description: 'Include unit tests with React Testing Library'
        }
      },
      required: ['componentName', 'description']
    }
  },
  {
    name: 'deepseek_generate_api_route',
    description: 'Generate API routes for Next.js or Express with validation and documentation',
    inputSchema: {
      type: 'object',
      properties: {
        routePath: {
          type: 'string',
          description: 'API route path (e.g., /api/users)'
        },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
          description: 'HTTP method'
        },
        description: {
          type: 'string',
          description: 'Description of API functionality'
        },
        framework: {
          type: 'string',
          enum: ['nextjs', 'express', 'nestjs'],
          description: 'Backend framework'
        },
        includeValidation: {
          type: 'boolean',
          description: 'Include request validation with Zod'
        },
        includeAuth: {
          type: 'boolean',
          description: 'Include authentication middleware'
        }
      },
      required: ['routePath', 'description']
    }
  },
  {
    name: 'deepseek_create_ui_design_system',
    description: 'Create design system components with variants and Storybook documentation',
    inputSchema: {
      type: 'object',
      properties: {
        componentType: {
          type: 'string',
          description: 'Type of UI component (button, input, card, etc.)'
        },
        variants: {
          type: 'array',
          items: { type: 'string' },
          description: 'Component variants (primary, secondary, danger, etc.)'
        },
        theme: {
          type: 'string',
          enum: ['replit', 'material', 'chakra', 'custom'],
          description: 'Design system theme'
        },
        includeStorybook: {
          type: 'boolean',
          description: 'Include Storybook stories for documentation'
        }
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
        code: {
          type: 'string',
          description: 'Frontend code to optimize'
        },
        focusArea: {
          type: 'string',
          enum: ['general', 'loading', 'runtime', 'bundle-size', 'memory'],
          description: 'Performance optimization focus area'
        },
        targetMetrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['LCP', 'FID', 'CLS', 'FCP', 'TTI', 'TBT']
          },
          description: 'Target Core Web Vitals metrics'
        },
        bundleAnalysis: {
          type: 'boolean',
          description: 'Include bundle size analysis recommendations'
        }
      },
      required: ['code']
    }
  }
];
