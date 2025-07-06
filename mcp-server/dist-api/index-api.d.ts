#!/usr/bin/env node
/**
 * MCP Server for DeepSeek R1 via Hugging Face API
 * Использует платную подписку Hugging Face для работы с DeepSeek R1
 */
/**
 * MCP сервер для работы с DeepSeek R1 через Hugging Face API
 */
declare class McpDeepSeekApiServer {
    private server;
    constructor();
    /**
     * Настройка обработки ошибок
     */
    private setupErrorHandling;
    /**
     * Настройка handlers для инструментов
     */
    private setupToolHandlers;
    /**
     * Общение с DeepSeek R1
     */
    private chatWithDeepSeek;
    /**
     * Анализ кода
     */
    private analyzeCode;
    /**
     * Генерация тестов
     */
    private generateTests;
    /**
     * Рефакторинг кода
     */
    private refactorCode;
    /**
     * Проверка состояния сервиса
     */
    private healthCheck;
    /**
     * Запуск сервера
     */
    start(): Promise<void>;
    /**
     * Очистка ресурсов
     */
    private cleanup;
}
export { McpDeepSeekApiServer };
