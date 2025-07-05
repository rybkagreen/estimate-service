/**
 * Simplified DeepSeek R1 MCP Tools
 * Упрощенная интеграция с DeepSeek R1 для MCP сервера
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
/**
 * Настройка инструментов DeepSeek R1 для MCP сервера
 */
export declare function setupDeepSeekTools(server: Server): void;
/**
 * Список доступных DeepSeek инструментов
 */
export declare const deepSeekToolsList: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            code: {
                type: string;
                description: string;
            };
            context: {
                type: string;
                description: string;
            };
            language: {
                type: string;
                enum: string[];
                description: string;
            };
            type?: undefined;
            framework?: undefined;
            testType?: undefined;
            goals?: undefined;
            description?: undefined;
            constraints?: undefined;
            domain?: undefined;
            message?: undefined;
            temperature?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            code: {
                type: string;
                description: string;
            };
            type: {
                type: string;
                enum: string[];
                description: string;
            };
            context?: undefined;
            language?: undefined;
            framework?: undefined;
            testType?: undefined;
            goals?: undefined;
            description?: undefined;
            constraints?: undefined;
            domain?: undefined;
            message?: undefined;
            temperature?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            code: {
                type: string;
                description: string;
            };
            framework: {
                type: string;
                enum: string[];
                description: string;
            };
            testType: {
                type: string;
                enum: string[];
                description: string;
            };
            context?: undefined;
            language?: undefined;
            type?: undefined;
            goals?: undefined;
            description?: undefined;
            constraints?: undefined;
            domain?: undefined;
            message?: undefined;
            temperature?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            code: {
                type: string;
                description: string;
            };
            goals: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            context?: undefined;
            language?: undefined;
            type?: undefined;
            framework?: undefined;
            testType?: undefined;
            description?: undefined;
            constraints?: undefined;
            domain?: undefined;
            message?: undefined;
            temperature?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            description: {
                type: string;
                description: string;
            };
            constraints: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            domain: {
                type: string;
                enum: string[];
                description: string;
            };
            code?: undefined;
            context?: undefined;
            language?: undefined;
            type?: undefined;
            framework?: undefined;
            testType?: undefined;
            goals?: undefined;
            message?: undefined;
            temperature?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            message: {
                type: string;
                description: string;
            };
            context: {
                type: string;
                description: string;
            };
            temperature: {
                type: string;
                minimum: number;
                maximum: number;
                description: string;
            };
            code?: undefined;
            language?: undefined;
            type?: undefined;
            framework?: undefined;
            testType?: undefined;
            goals?: undefined;
            description?: undefined;
            constraints?: undefined;
            domain?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            code?: undefined;
            context?: undefined;
            language?: undefined;
            type?: undefined;
            framework?: undefined;
            testType?: undefined;
            goals?: undefined;
            description?: undefined;
            constraints?: undefined;
            domain?: undefined;
            message?: undefined;
            temperature?: undefined;
        };
        required: never[];
    };
})[];
