/**
 * Сервис для работы с базой данных
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export interface DatabaseConfig {
  url: string;
  maxConnections: number;
}

export class DatabaseService {
  private prisma: PrismaClient | null = null;
  private config: DatabaseConfig;
  private isConnected = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  /**
   * Инициализация подключения к базе данных
   */
  async initialize(): Promise<void> {
    try {
      logger.info('📊 Подключение к базе данных...');

      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.url,
          },
        },
        log: ['error', 'warn'],
      });

      // Проверяем соединение
      await this.prisma.$connect();
      this.isConnected = true;

      logger.info('✅ Подключение к базе данных установлено');
    } catch (error) {
      logger.error('❌ Ошибка подключения к базе данных:', error);
      this.isConnected = false;

      // В режиме разработки можем работать без БД
      if (process.env.NODE_ENV === 'development') {
        logger.warn('⚠️ Продолжаем работу без базы данных (dev режим)');
      } else {
        throw error;
      }
    }
  }

  /**
   * Получить клиент Prisma
   */
  getClient(): PrismaClient | null {
    return this.prisma;
  }

  /**
   * Проверка состояния подключения
   */
  isReady(): boolean {
    return this.isConnected && this.prisma !== null;
  }

  /**
   * Выполнить SQL запрос
   */
  async executeRaw(sql: string, params?: any[]): Promise<any> {
    if (!this.isReady()) {
      throw new Error('База данных не подключена');
    }

    try {
      const result = await this.prisma!.$queryRawUnsafe(sql, ...(params || []));
      logger.debug('✅ SQL запрос выполнен:', { sql: sql.substring(0, 100) });
      return result;
    } catch (error) {
      logger.error('❌ Ошибка выполнения SQL запроса:', error);
      throw error;
    }
  }

  /**
   * Получить информацию о таблицах
   */
  async getTables(): Promise<string[]> {
    if (!this.isReady()) {
      return [];
    }

    try {
      const result = await this.executeRaw(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
      `);

      return result.map((row: any) => row.table_name);
    } catch (error) {
      logger.error('❌ Ошибка получения списка таблиц:', error);
      return [];
    }
  }

  /**
   * Получить схему таблицы
   */
  async getTableSchema(tableName: string): Promise<any[]> {
    if (!this.isReady()) {
      return [];
    }

    try {
      const result = await this.executeRaw(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      return result;
    } catch (error) {
      logger.error(`❌ Ошибка получения схемы таблицы ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Получить статистику базы данных
   */
  async getDatabaseStats(): Promise<{
    tables: number;
    connections: number;
    size: string;
    uptime: string;
  }> {
    if (!this.isReady()) {
      return {
        tables: 0,
        connections: 0,
        size: 'unknown',
        uptime: 'unknown',
      };
    }

    try {
      const tables = await this.getTables();

      // Получаем количество активных соединений
      const connectionResult = await this.executeRaw(`
        SELECT count(*) as count
        FROM pg_stat_activity
        WHERE state = 'active'
      `);

      // Получаем размер базы данных
      const sizeResult = await this.executeRaw(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);

      // Получаем время работы сервера
      const uptimeResult = await this.executeRaw(`
        SELECT date_trunc('second', current_timestamp - pg_postmaster_start_time()) as uptime
      `);

      return {
        tables: tables.length,
        connections: connectionResult[0]?.count || 0,
        size: sizeResult[0]?.size || 'unknown',
        uptime: uptimeResult[0]?.uptime || 'unknown',
      };
    } catch (error) {
      logger.error('❌ Ошибка получения статистики БД:', error);
      return {
        tables: 0,
        connections: 0,
        size: 'error',
        uptime: 'error',
      };
    }
  }

  /**
   * Проверка здоровья базы данных
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    latency: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      if (!this.isReady()) {
        return {
          status: 'unhealthy',
          latency: 0,
          error: 'Нет подключения к базе данных',
        };
      }

      await this.executeRaw('SELECT 1');
      const latency = Date.now() - startTime;

      return {
        status: 'healthy',
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;

      return {
        status: 'unhealthy',
        latency,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Закрытие подключения
   */
  async shutdown(): Promise<void> {
    if (this.prisma) {
      logger.info('🔌 Закрытие подключения к базе данных...');

      try {
        await this.prisma.$disconnect();
        this.isConnected = false;
        this.prisma = null;

        logger.info('✅ Подключение к базе данных закрыто');
      } catch (error) {
        logger.error('❌ Ошибка закрытия подключения к БД:', error);
      }
    }
  }
}
