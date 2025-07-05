#!/usr/bin/env node
/**
 * Simple Estimate Service MCP Server with DeepSeek R1
 * Простой MCP сервер с интеграцией DeepSeek R1
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { deepSeekService } from './services/deepseek.service.js';
import { logger } from './utils/logger.js';
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
 * Tool handlers
 */
async function handleAnalyzeCode(args) {
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
    }
    catch (error) {
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
async function handleChat(args) {
    try {
        const { message, context = '', temperature = 0.3 } = args;
        logger.info(`💬 Chat with DeepSeek R1: ${message.slice(0, 50)}...`);
        const messages = [
            {
                role: 'system',
                content: context || 'You are an AI assistant helping with software development for the Estimate Service project.'
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
 * Main server setup
 */
async function main() {
    const server = new Server({
        name: 'estimate-service-mcp-simple',
        version: '1.0.0',
        description: 'Simple MCP server for Estimate Service with DeepSeek R1 integration',
    });
    // List tools
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools: DEEPSEEK_TOOLS };
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
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    });
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info('🚀 Simple Estimate Service MCP Server with DeepSeek R1 started successfully');
    logger.info(`📋 Available tools: ${DEEPSEEK_TOOLS.map(t => t.name).join(', ')}`);
}
main().catch((error) => {
    logger.error('❌ MCP Server failed to start:', error);
    process.exit(1);
});
