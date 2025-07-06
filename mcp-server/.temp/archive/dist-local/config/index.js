"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv = require("dotenv");
var path = require("path");
var zod_1 = require("zod");
// Load environment variables - try .env.local first, then .env
dotenv.config({ path: path.resolve('.env.local') });
dotenv.config({ path: path.resolve('.env') });
dotenv.config({ path: path.resolve('../.env') });
var configSchema = zod_1.z.object({
    // Server configuration
    server: zod_1.z.object({
        port: zod_1.z.number().default(3333),
        host: zod_1.z.string().default('localhost'),
        logLevel: zod_1.z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    }),
    // Project paths
    project: zod_1.z.object({
        rootPath: zod_1.z.string().default('/workspaces/estimate-service'),
        servicePath: zod_1.z.string().default('/workspaces/estimate-service/services/estimate-service'),
        docsPath: zod_1.z.string().default('/workspaces/estimate-service/docs'),
        libsPath: zod_1.z.string().default('/workspaces/estimate-service/libs'),
    }),
    // Database configuration
    database: zod_1.z.object({
        url: zod_1.z.string(),
        maxConnections: zod_1.z.number().default(10),
    }),
    // AI Services
    ai: zod_1.z.object({
        deepseek: zod_1.z.object({
            apiKey: zod_1.z.string(),
            model: zod_1.z.string().default('deepseek-chat'),
            baseUrl: zod_1.z.string().default('https://api.deepseek.com'),
            maxTokens: zod_1.z.number().default(4000),
            temperature: zod_1.z.number().default(0.3),
            timeout: zod_1.z.number().default(30000),
            mockMode: zod_1.z.boolean().default(false),
        }),
        huggingface: zod_1.z.object({
            modelName: zod_1.z.string().default('deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B'),
            modelPath: zod_1.z.string().default('./models/deepseek-r1'),
            maxTokens: zod_1.z.number().default(512),
            temperature: zod_1.z.number().default(0.7),
            mockMode: zod_1.z.boolean().default(true),
            useLocal: zod_1.z.boolean().default(true),
        }).optional(),
    }),
    // External APIs
    external: zod_1.z.object({
        grandSmeta: zod_1.z.object({
            apiUrl: zod_1.z.string().default('https://api.grandsmeta.ru'),
            apiKey: zod_1.z.string().optional(),
        }),
    }),
    // Development tools
    development: zod_1.z.object({
        enableDebug: zod_1.z.boolean().default(true),
        enableMetrics: zod_1.z.boolean().default(true),
        enableTesting: zod_1.z.boolean().default(true),
    }),
});
// Parse and validate configuration
var rawConfig = {
    server: {
        port: parseInt(process.env.MCP_SERVER_PORT || '3333'),
        host: process.env.MCP_SERVER_HOST || 'localhost',
        logLevel: process.env.LOG_LEVEL || 'info',
    },
    project: {
        rootPath: process.env.PROJECT_ROOT_PATH || '/workspaces/estimate-service',
        servicePath: process.env.SERVICE_PATH || '/workspaces/estimate-service/services/estimate-service',
        docsPath: process.env.DOCS_PATH || '/workspaces/estimate-service/docs',
        libsPath: process.env.LIBS_PATH || '/workspaces/estimate-service/libs',
    },
    database: {
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/estimate_service',
        maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
    },
    ai: {
        deepseek: {
            apiKey: process.env.DEEPSEEK_API_KEY || '',
            model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
            baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
            maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS || '4000'),
            temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
            timeout: parseInt(process.env.DEEPSEEK_TIMEOUT || '30000'),
            mockMode: process.env.DEEPSEEK_MOCK_MODE === 'true',
        },
        huggingface: {
            modelName: process.env.HUGGINGFACE_MODEL_NAME || 'deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
            modelPath: process.env.HUGGINGFACE_MODEL_PATH || './models/deepseek-r1',
            maxTokens: parseInt(process.env.HUGGINGFACE_MAX_TOKENS || '512'),
            temperature: parseFloat(process.env.HUGGINGFACE_TEMPERATURE || '0.7'),
            mockMode: process.env.HUGGINGFACE_MOCK_MODE !== 'false',
            useLocal: process.env.HUGGINGFACE_USE_LOCAL !== 'false',
        },
    },
    external: {
        grandSmeta: {
            apiUrl: process.env.GRAND_SMETA_API_URL || 'https://api.grandsmeta.ru',
            apiKey: process.env.GRAND_SMETA_API_KEY,
        },
    },
    development: {
        enableDebug: process.env.NODE_ENV === 'development',
        enableMetrics: process.env.METRICS_ENABLED === 'true',
        enableTesting: process.env.TESTING_ENABLED !== 'false',
    },
};
exports.config = configSchema.parse(rawConfig);
// Log configuration summary
if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Configuration loaded:', {
        useLocalModel: (_a = exports.config.ai.huggingface) === null || _a === void 0 ? void 0 : _a.useLocal,
        modelName: (_b = exports.config.ai.huggingface) === null || _b === void 0 ? void 0 : _b.modelName,
        mockMode: (_c = exports.config.ai.huggingface) === null || _c === void 0 ? void 0 : _c.mockMode,
    });
}
