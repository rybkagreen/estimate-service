/**
 * Hugging Face API Service for DeepSeek R1
 * Сервис для работы с моделью DeepSeek R1 через Hugging Face API (платная подписка)
 */
export interface HuggingFaceMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface HuggingFaceGenerationOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
    repetitionPenalty?: number;
}
export interface HuggingFaceResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
/**
 * Сервис для работы с DeepSeek R1 через Hugging Face API
 */
export declare class HuggingFaceApiService {
    private client;
    private readonly modelName;
    private readonly apiKey;
    private isInitialized;
    constructor();
    /**
     * Инициализация сервиса
     */
    initialize(): Promise<void>;
    /**
     * Проверка подключения к API
     */
    private testConnection;
    /**
     * Генерация ответа через DeepSeek R1
     */
    generateResponse(messages: HuggingFaceMessage[], options?: HuggingFaceGenerationOptions): Promise<HuggingFaceResponse>;
    /**
     * Потоковая генерация ответа
     */
    private generateStreamingResponse;
    /**
     * Анализ кода с помощью DeepSeek R1
     */
    analyzeCode(code: string, language?: string): Promise<string>;
    /**
     * Генерация тестов
     */
    generateTests(code: string, language?: string): Promise<string>;
    /**
     * Рефакторинг кода
     */
    refactorCode(code: string, language?: string, instructions?: string): Promise<string>;
    /**
     * Проверка состояния сервиса
     */
    getHealthStatus(): {
        service: string;
        status: string;
        model: string;
        hasApiKey: boolean;
        timestamp: string;
    };
    /**
     * Очистка ресурсов
     */
    cleanup(): Promise<void>;
}
export declare const huggingFaceApiService: HuggingFaceApiService;
