/**
 * Simplified DeepSeek R1 MCP Tools
 * Упрощенная интеграция с DeepSeek R1 для MCP сервера
 */
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { deepSeekService } from '../services/deepseek.service.js';
import { logger } from '../utils/logger.js';
/**
 * Настройка инструментов DeepSeek R1 для MCP сервера
 */
export function setupDeepSeekTools(server) {
    // Universal handler for all DeepSeek tools
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        // Handle DeepSeek tools
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
            default:
                // Not a DeepSeek tool, let other handlers process it
                return;
        }
    });
    logger.info('🤖 DeepSeek R1 tools registered successfully');
}
async function handleAnalyzeCode(args) {
    try {
        const { code, context = '', language = 'typescript' } = args;
        if (!code) {
            throw new Error('Code is required');
        }
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
    }
    catch (error) {
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
async function handleGenerateDocs(args) {
    try {
        const { code, type = 'function' } = args;
        if (!code) {
            throw new Error('Code is required');
        }
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
    }
    catch (error) {
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
async function handleGenerateTests(args) {
    try {
        const { code, framework = 'jest', testType = 'unit' } = args;
        if (!code) {
            throw new Error('Code is required');
        }
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
    }
    catch (error) {
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
async function handleRefactorCode(args) {
    try {
        const { code, goals = [] } = args;
        if (!code) {
            throw new Error('Code is required');
        }
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
    }
    catch (error) {
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
async function handleArchitectureAdvice(args) {
    try {
        const { description, constraints = [], domain = 'fullstack' } = args;
        if (!description) {
            throw new Error('Description is required');
        }
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
    }
    catch (error) {
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
}
async function handleChat(args) {
    try {
        const { message, context = '', temperature = 0.3 } = args;
        if (!message) {
            throw new Error('Message is required');
        }
        logger.info(`💬 DeepSeek chat: ${message.substring(0, 50)}...`);
        const messages = [
            {
                role: 'system',
                content: `Ты - ИИ-ассистент для разработки Estimate Service.
Помогаешь с React, TypeScript, NestJS, Prisma, PostgreSQL разработкой.
${context ? `\nКонтекст: ${context}` : ''}`
            },
            {
                role: 'user',
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
    }
    catch (error) {
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
async function handleHealthCheck(args) {
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
    }
    catch (error) {
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
