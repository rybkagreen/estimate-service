/**
 * Novita Provider Client for DeepSeek R1
 * HTTP клиент для работы с DeepSeek R1 через провайдер Novita
 */
export interface NovitaMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export interface NovitaGenerationOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    stream?: boolean;
}
export interface NovitaResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}
export interface NovitaStreamChunk {
    choices: Array<{
        delta: {
            content?: string;
        };
    }>;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
/**
 * Клиент для работы с DeepSeek R1 через провайдер Novita
 */
export declare class NovitaClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly modelName;
    constructor();
    /**
     * Отправка HTTP запроса к API
     */
    private makeRequest;
    /**
     * Генерация ответа через Novita API
     */
    generateResponse(messages: NovitaMessage[], options?: NovitaGenerationOptions): Promise<NovitaResponse>;
    /**
     * Потоковая генерация (пока что эмулируется)
     */
    private generateStreamingResponse;
    /**
     * Форматирование сообщений для Novita API
     */
    private formatMessagesForNovita;
    /**
     * Тест подключения к API
     */
    testConnection(): Promise<void>;
    /**
     * Проверка состояния сервиса
     */
    getHealthStatus(): {
        service: string;
        status: string;
        provider: string;
        model: string;
        hasApiKey: boolean;
        timestamp: string;
    };
}
export declare const novitaClient: NovitaClient;
