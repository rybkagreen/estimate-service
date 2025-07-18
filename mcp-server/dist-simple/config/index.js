import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';
// Load environment variables - try .env.local first, then .env
dotenv.config({ path: path.resolve('.env.local') });
dotenv.config({ path: path.resolve('.env') });
dotenv.config({ path: path.resolve('../.env') });
const configSchema = z.object({
    // Server configuration
    server: z.object({
        port: z.number().default(3333),
        host: z.string().default('localhost'),
        logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    }),
    // Project paths
    project: z.object({
        rootPath: z.string().default('/workspaces/estimate-service'),
        servicePath: z.string().default('/workspaces/estimate-service/services/estimate-service'),
        docsPath: z.string().default('/workspaces/estimate-service/docs'),
        libsPath: z.string().default('/workspaces/estimate-service/libs'),
    }),
    // Database configuration
    database: z.object({
        url: z.string(),
        maxConnections: z.number().default(10),
    }),
    // AI Services
    ai: z.object({
        deepseek: z.object({
            apiKey: z.string(),
            model: z.string().default('deepseek-chat'),
            baseUrl: z.string().default('https://api.deepseek.com'),
            maxTokens: z.number().default(4000),
            temperature: z.number().default(0.3),
            timeout: z.number().default(30000),
            mockMode: z.boolean().default(false),
        }),
        huggingface: z.object({
            apiKey: z.string().optional(),
            provider: z.string().default('novita'),
            modelName: z.string().default('deepseek/deepseek-r1-0528'),
            modelPath: z.string().default('./models/deepseek-r1'),
            maxTokens: z.number().default(2048),
            temperature: z.number().default(0.7),
            mockMode: z.boolean().default(false),
            useLocal: z.boolean().default(false),
            useApi: z.boolean().default(true),
        }).optional(),
    }),
    // External APIs
    external: z.object({
        grandSmeta: z.object({
            apiUrl: z.string().default('https://api.grandsmeta.ru'),
            apiKey: z.string().optional(),
        }),
        fsbc: z.object({
            apiUrl: z.string().default('https://api.fsbc.ru/v2'),
            apiKey: z.string().optional(),
            apiSecret: z.string().optional(),
            regionCode: z.string().default('77'),
            priceLevel: z.enum(['current', 'base']).default('current'),
            cacheTtl: z.number().default(86400),
            requestTimeout: z.number().default(30000),
            maxRetryAttempts: z.number().default(3),
            retryDelay: z.number().default(1000),
        }),
    }),
    // Development tools
    development: z.object({
        enableDebug: z.boolean().default(true),
        enableMetrics: z.boolean().default(true),
        enableTesting: z.boolean().default(true),
    }),
});
// Parse and validate configuration
const rawConfig = {
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
            apiKey: process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY,
            provider: process.env.HUGGINGFACE_PROVIDER || 'novita',
            modelName: process.env.HUGGINGFACE_MODEL_NAME || 'deepseek/deepseek-r1-turbo',
            modelPath: process.env.HUGGINGFACE_MODEL_PATH || './models/deepseek-r1',
            maxTokens: parseInt(process.env.HUGGINGFACE_MAX_TOKENS || '2048'),
            temperature: parseFloat(process.env.HUGGINGFACE_TEMPERATURE || '0.7'),
            mockMode: process.env.HUGGINGFACE_MOCK_MODE === 'true',
            useLocal: process.env.HUGGINGFACE_USE_LOCAL === 'true',
            useApi: process.env.HUGGINGFACE_USE_API !== 'false',
        },
    },
    external: {
        grandSmeta: {
            apiUrl: process.env.GRAND_SMETA_API_URL || 'https://api.grandsmeta.ru',
            apiKey: process.env.GRAND_SMETA_API_KEY,
        },
        fsbc: {
            apiUrl: process.env.FSBC_API_URL || 'https://api.fsbc.ru/v2',
            apiKey: process.env.FSBC_API_KEY,
            apiSecret: process.env.FSBC_API_SECRET,
            regionCode: process.env.FSBC_REGION_CODE || '77',
            priceLevel: process.env.FSBC_PRICE_LEVEL || 'current',
            cacheTtl: parseInt(process.env.FSBC_CACHE_TTL || '86400'),
            requestTimeout: parseInt(process.env.FSBC_REQUEST_TIMEOUT || '30000'),
            maxRetryAttempts: parseInt(process.env.FSBC_MAX_RETRY_ATTEMPTS || '3'),
            retryDelay: parseInt(process.env.FSBC_RETRY_DELAY || '1000'),
        },
    },
    development: {
        enableDebug: process.env.NODE_ENV === 'development',
        enableMetrics: process.env.METRICS_ENABLED === 'true',
        enableTesting: process.env.TESTING_ENABLED !== 'false',
    },
};
export const config = configSchema.parse(rawConfig);
// Log configuration summary
if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Configuration loaded:', {
        useLocalModel: config.ai.huggingface?.useLocal,
        modelName: config.ai.huggingface?.modelName,
        mockMode: config.ai.huggingface?.mockMode,
    });
}
