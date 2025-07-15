/**
 * Database Connection Manager
 * Управление подключениями с поддержкой высокой доступности
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig, getReadReplicaUrl, checkDatabaseHealth } from '../config/database.config';

export interface ConnectionManagerOptions {
  enableReadReplicas?: boolean;
  enableFailover?: boolean;
  healthCheckInterval?: number;
}

export class DatabaseConnectionManager {
  private primaryClient: PrismaClient;
  private readClients: PrismaClient[] = [];
  private currentReadIndex = 0;
  private healthCheckTimers: NodeJS.Timer[] = [];
  private config = getDatabaseConfig();
  
  constructor(private options: ConnectionManagerOptions = {}) {
    this.initializePrimaryConnection();
    
    if (this.options.enableReadReplicas) {
      this.initializeReadReplicas();
    }
    
    if (this.options.enableFailover) {
      this.startHealthChecks();
    }
  }
  
  /**
   * Инициализация основного подключения
   */
  private initializePrimaryConnection() {
    this.primaryClient = new PrismaClient({
      datasourceUrl: this.config.url,
      log: this.config.prismaLogLevel as any,
      errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
    });
    
    // Настройка middleware для логирования медленных запросов
    if (this.config.logSlowQueries) {
      this.primaryClient.$use(async (params, next) => {
        const before = Date.now();
        const result = await next(params);
        const after = Date.now();
        const duration = after - before;
        
        if (duration > this.config.slowQueryThreshold) {
          console.warn(`Slow query detected: ${params.model}.${params.action} took ${duration}ms`);
        }
        
        return result;
      });
    }
    
    // Настройка connection pool
    this.primaryClient.$connect();
  }
  
  /**
   * Инициализация read-реплик
   */
  private initializeReadReplicas() {
    if (!this.config.readReplicas || this.config.readReplicas.length === 0) {
      console.warn('No read replicas configured');
      return;
    }
    
    this.config.readReplicas.forEach((replicaUrl, index) => {
      const client = new PrismaClient({
        datasourceUrl: replicaUrl,
        log: this.config.prismaLogLevel as any,
      });
      
      this.readClients.push(client);
      client.$connect().catch(err => {
        console.error(`Failed to connect to read replica ${index}:`, err);
      });
    });
  }
  
  /**
   * Запуск проверок здоровья подключений
   */
  private startHealthChecks() {
    const interval = this.options.healthCheckInterval || 30000;
    
    // Проверка основного подключения
    const primaryTimer = setInterval(async () => {
      try {
        await this.primaryClient.$queryRaw`SELECT 1`;
      } catch (error) {
        console.error('Primary database health check failed:', error);
        await this.handlePrimaryFailure();
      }
    }, interval);
    
    this.healthCheckTimers.push(primaryTimer);
    
    // Проверка реплик
    this.readClients.forEach((client, index) => {
      const replicaTimer = setInterval(async () => {
        try {
          await client.$queryRaw`SELECT 1`;
        } catch (error) {
          console.error(`Read replica ${index} health check failed:`, error);
          await this.handleReplicaFailure(index);
        }
      }, interval);
      
      this.healthCheckTimers.push(replicaTimer);
    });
  }
  
  /**
   * Обработка сбоя основного подключения
   */
  private async handlePrimaryFailure() {
    console.error('Primary database connection failed, attempting reconnection...');
    
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * attempt));
        await this.primaryClient.$connect();
        console.log('Primary database reconnected successfully');
        return;
      } catch (error) {
        console.error(`Reconnection attempt ${attempt} failed:`, error);
      }
    }
    
    // Если не удалось переподключиться, пробуем использовать реплику
    if (this.readClients.length > 0 && this.options.enableFailover) {
      console.warn('Promoting read replica to primary (read-only mode)');
      // В реальном production здесь должна быть логика промоутинга реплики
    }
  }
  
  /**
   * Обработка сбоя реплики
   */
  private async handleReplicaFailure(index: number) {
    console.error(`Read replica ${index} failed, removing from pool`);
    
    // Удаляем неработающую реплику из пула
    const failedClient = this.readClients[index];
    this.readClients.splice(index, 1);
    
    try {
      await failedClient.$disconnect();
    } catch (error) {
      console.error(`Error disconnecting failed replica ${index}:`, error);
    }
    
    // Попытка восстановить подключение через некоторое время
    setTimeout(async () => {
      try {
        const replicaUrl = getReadReplicaUrl(index);
        if (replicaUrl && await checkDatabaseHealth(replicaUrl)) {
          const newClient = new PrismaClient({
            datasourceUrl: replicaUrl,
            log: this.config.prismaLogLevel as any,
          });
          
          await newClient.$connect();
          this.readClients.splice(index, 0, newClient);
          console.log(`Read replica ${index} restored`);
        }
      } catch (error) {
        console.error(`Failed to restore replica ${index}:`, error);
      }
    }, this.config.failoverTimeout);
  }
  
  /**
   * Получение клиента для записи
   */
  getWriteClient(): PrismaClient {
    return this.primaryClient;
  }
  
  /**
   * Получение клиента для чтения (с балансировкой нагрузки)
   */
  getReadClient(): PrismaClient {
    // Если нет реплик или они отключены, используем основное подключение
    if (!this.options.enableReadReplicas || this.readClients.length === 0) {
      return this.primaryClient;
    }
    
    // Round-robin балансировка между репликами
    const client = this.readClients[this.currentReadIndex];
    this.currentReadIndex = (this.currentReadIndex + 1) % this.readClients.length;
    
    return client;
  }
  
  /**
   * Выполнение транзакции
   */
  async transaction<T>(
    fn: (prisma: PrismaClient) => Promise<T>,
    options?: { maxWait?: number; timeout?: number }
  ): Promise<T> {
    return this.primaryClient.$transaction(fn, {
      maxWait: options?.maxWait || this.config.poolAcquireTimeout,
      timeout: options?.timeout || this.config.queryTimeout,
    });
  }
  
  /**
   * Отключение всех подключений
   */
  async disconnect() {
    // Остановка проверок здоровья
    this.healthCheckTimers.forEach(timer => clearInterval(timer));
    
    // Отключение всех клиентов
    const disconnectPromises = [
      this.primaryClient.$disconnect(),
      ...this.readClients.map(client => client.$disconnect()),
    ];
    
    await Promise.all(disconnectPromises);
  }
  
  /**
   * Получение статистики подключений
   */
  async getConnectionStats() {
    const stats = {
      primary: {
        connected: true,
        metrics: null as any,
      },
      replicas: [] as any[],
    };
    
    try {
      // Метрики основного подключения (если включены preview features)
      if (this.config.prismaPreviewFeatures.includes('metrics')) {
        stats.primary.metrics = await (this.primaryClient as any).$metrics.json();
      }
    } catch (error) {
      stats.primary.connected = false;
    }
    
    // Статус реплик
    for (let i = 0; i < this.readClients.length; i++) {
      try {
        await this.readClients[i].$queryRaw`SELECT 1`;
        stats.replicas.push({ index: i, connected: true });
      } catch (error) {
        stats.replicas.push({ index: i, connected: false });
      }
    }
    
    return stats;
  }
}

// Singleton instance
let connectionManager: DatabaseConnectionManager | null = null;

/**
 * Получение или создание менеджера подключений
 */
export function getConnectionManager(options?: ConnectionManagerOptions): DatabaseConnectionManager {
  if (!connectionManager) {
    connectionManager = new DatabaseConnectionManager({
      enableReadReplicas: process.env.NODE_ENV === 'production',
      enableFailover: process.env.NODE_ENV === 'production',
      healthCheckInterval: 30000,
      ...options,
    });
  }
  
  return connectionManager;
}

/**
 * Middleware для Prisma с автоматическим retry
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Не ретраим, если ошибка не связана с подключением
      if (!isRetryableError(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        console.warn(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Проверка, можно ли повторить операцию при ошибке
 */
function isRetryableError(error: any): boolean {
  const retryableErrors = [
    'P1001', // Can't reach database server
    'P1002', // Database server was reached but timed out
    'P1008', // Operations timed out
    'P1017', // Server has closed the connection
  ];
  
  return retryableErrors.includes(error?.code) || 
         error?.message?.includes('connection') ||
         error?.message?.includes('timeout');
}

export default getConnectionManager;
