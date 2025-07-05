/**
 * DeepSeek R1 AI Service for MCP Server
 * Интеграция с DeepSeek R1 для помощи в разработке
 */
export interface DeepSeekMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface DeepSeekRequest {
    model: string;
    messages: DeepSeekMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}
export interface DeepSeekResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
/**
 * Сервис для работы с DeepSeek R1 API
 */
export declare class DeepSeekService {
    private client;
    private readonly apiKey;
    private readonly model;
    private readonly baseUrl;
    constructor();
    /**
     * Отправка запроса к DeepSeek R1
     */
    chat(messages: DeepSeekMessage[], options?: {
        temperature?: number;
        maxTokens?: number;
    }): Promise<string>;
    /**
     * Анализ кода с помощью DeepSeek R1
     */
    analyzeCode(code: string, context?: string): Promise<string>;
    /**
     * Генерация документации с помощью DeepSeek R1
     */
    generateDocumentation(code: string, type?: 'function' | 'class' | 'component' | 'api'): Promise<string>;
    /**
     * Помощь в написании тестов
     */
    generateTests(code: string, framework?: 'jest' | 'vitest' | 'playwright'): Promise<string>;
    /**
     * Рефакторинг кода
     */
    refactorCode(code: string, goals: string[]): Promise<string>;
    /**
     * Помощь в архитектурных решениях
     */
    architectureAdvice(description: string, constraints?: string[]): Promise<string>;
    /**
     * Проверка работоспособности DeepSeek API
     */
    healthCheck(): Promise<{
        status: 'ok' | 'error';
        message: string;
        latency?: number;
    }>;
}
export declare const deepSeekService: DeepSeekService;
