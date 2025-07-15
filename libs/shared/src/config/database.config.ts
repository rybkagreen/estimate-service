/**
 * Production Database Configuration
 * Настройки PostgreSQL для высокой доступности и производительности
 */

export interface DatabaseConfig {
  // Основное подключение
  url: string;
  
  // Connection Pooling
  poolSize: number;
  poolMin: number;
  poolMax: number;
  poolIdleTimeout: number;
  poolAcquireTimeout: number;
  poolCreateTimeout: number;
  poolDestroyTimeout: number;
  poolReapInterval: number;
  
  // SSL Configuration
  ssl: {
    enabled: boolean;
    rejectUnauthorized: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  
  // High Availability
  readReplicas?: string[];
  failoverTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  
  // Performance Optimization
  statementTimeout: number;
  queryTimeout: number;
  connectionTimeout: number;
  keepAlive: boolean;
  keepAliveInitialDelayMillis: number;
  
  // Query Optimization
  preparedStatements: boolean;
  cachePreparedStatements: boolean;
  preparedStatementsCacheSize: number;
  
  // Connection String Parameters
  applicationName: string;
  schema: string;
  searchPath: string;
  timezone: string;
  
  // Monitoring
  logQueries: boolean;
  logSlowQueries: boolean;
  slowQueryThreshold: number;
  
  // Prisma-specific
  prismaLogLevel: string[];
  prismaPreviewFeatures: string[];
}

/**
 * Получение конфигурации базы данных из переменных окружения
 */
export function getDatabaseConfig(): DatabaseConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Базовый URL с параметрами для production
  const baseUrl = process.env.DATABASE_URL || '';
  const urlWithParams = addConnectionParams(baseUrl, isProduction);
  
  return {
    // Основное подключение
    url: urlWithParams,
    
    // Connection Pooling (оптимизировано для production)
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '20', 10),
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '30', 10),
    poolIdleTimeout: parseInt(process.env.DATABASE_POOL_IDLE_TIMEOUT || '30000', 10),
    poolAcquireTimeout: parseInt(process.env.DATABASE_POOL_ACQUIRE_TIMEOUT || '30000', 10),
    poolCreateTimeout: parseInt(process.env.DATABASE_POOL_CREATE_TIMEOUT || '30000', 10),
    poolDestroyTimeout: parseInt(process.env.DATABASE_POOL_DESTROY_TIMEOUT || '5000', 10),
    poolReapInterval: parseInt(process.env.DATABASE_POOL_REAP_INTERVAL || '1000', 10),
    
    // SSL Configuration
    ssl: {
      enabled: process.env.DATABASE_SSL === 'true' || isProduction,
      rejectUnauthorized: process.env.DATABASE_SSL_REJECT_UNAUTHORIZED !== 'false',
      ca: process.env.DATABASE_SSL_CA,
      cert: process.env.DATABASE_SSL_CERT,
      key: process.env.DATABASE_SSL_KEY,
    },
    
    // High Availability
    readReplicas: process.env.DATABASE_READ_REPLICAS?.split(',').filter(Boolean),
    failoverTimeout: parseInt(process.env.DATABASE_FAILOVER_TIMEOUT || '5000', 10),
    retryAttempts: parseInt(process.env.DATABASE_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.DATABASE_RETRY_DELAY || '1000', 10),
    
    // Performance Optimization
    statementTimeout: parseInt(process.env.DATABASE_STATEMENT_TIMEOUT || '30000', 10),
    queryTimeout: parseInt(process.env.DATABASE_QUERY_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DATABASE_CONNECTION_TIMEOUT || '30000', 10),
    keepAlive: process.env.DATABASE_KEEP_ALIVE !== 'false',
    keepAliveInitialDelayMillis: parseInt(
      process.env.DATABASE_KEEP_ALIVE_INITIAL_DELAY || '10000',
      10
    ),
    
    // Query Optimization
    preparedStatements: process.env.DATABASE_PREPARED_STATEMENTS !== 'false',
    cachePreparedStatements: process.env.DATABASE_CACHE_PREPARED_STATEMENTS !== 'false',
    preparedStatementsCacheSize: parseInt(
      process.env.DATABASE_PREPARED_STATEMENTS_CACHE_SIZE || '100',
      10
    ),
    
    // Connection String Parameters
    applicationName: process.env.DATABASE_APPLICATION_NAME || 'estimate-service',
    schema: process.env.DATABASE_SCHEMA || 'public',
    searchPath: process.env.DATABASE_SEARCH_PATH || 'public',
    timezone: process.env.DATABASE_TIMEZONE || 'UTC',
    
    // Monitoring
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
    logSlowQueries: process.env.DATABASE_LOG_SLOW_QUERIES !== 'false',
    slowQueryThreshold: parseInt(process.env.DATABASE_SLOW_QUERY_THRESHOLD || '1000', 10),
    
    // Prisma-specific
    prismaLogLevel: (process.env.PRISMA_LOG_LEVEL || 'error,warn').split(','),
    prismaPreviewFeatures: (process.env.PRISMA_PREVIEW_FEATURES || '').split(',').filter(Boolean),
  };
}

/**
 * Добавление параметров подключения к URL базы данных
 */
function addConnectionParams(baseUrl: string, isProduction: boolean): string {
  if (!baseUrl) return '';
  
  const url = new URL(baseUrl);
  
  // Production параметры
  if (isProduction) {
    // SSL
    url.searchParams.set('sslmode', 'require');
    url.searchParams.set('sslcert', process.env.DATABASE_SSL_CERT || '');
    url.searchParams.set('sslkey', process.env.DATABASE_SSL_KEY || '');
    url.searchParams.set('sslrootcert', process.env.DATABASE_SSL_CA || '');
    
    // Connection pooling
    url.searchParams.set('pool_size', process.env.DATABASE_POOL_SIZE || '20');
    url.searchParams.set('connection_limit', process.env.DATABASE_POOL_MAX || '30');
    url.searchParams.set('pool_timeout', process.env.DATABASE_POOL_ACQUIRE_TIMEOUT || '30');
    
    // Performance
    url.searchParams.set('statement_timeout', process.env.DATABASE_STATEMENT_TIMEOUT || '30000');
    url.searchParams.set('idle_in_transaction_session_timeout', '60000');
    url.searchParams.set('connect_timeout', process.env.DATABASE_CONNECTION_TIMEOUT || '30');
    
    // Application identification
    url.searchParams.set('application_name', process.env.DATABASE_APPLICATION_NAME || 'estimate-service');
    
    // Prepared statements
    url.searchParams.set('prepare_threshold', '3');
    url.searchParams.set('max_prepared_statements', '100');
  }
  
  // Общие параметры
  url.searchParams.set('schema', process.env.DATABASE_SCHEMA || 'public');
  url.searchParams.set('timezone', process.env.DATABASE_TIMEZONE || 'UTC');
  
  return url.toString();
}

/**
 * Получение строки подключения для read-реплик
 */
export function getReadReplicaUrl(index: number = 0): string | null {
  const config = getDatabaseConfig();
  if (!config.readReplicas || config.readReplicas.length === 0) {
    return null;
  }
  
  const replicaUrl = config.readReplicas[index % config.readReplicas.length];
  return addConnectionParams(replicaUrl, process.env.NODE_ENV === 'production');
}

/**
 * Проверка доступности базы данных
 */
export async function checkDatabaseHealth(url: string): Promise<boolean> {
  try {
    const { Client } = await import('pg');
    const client = new Client({ connectionString: url });
    
    await client.connect();
    const result = await client.query('SELECT 1');
    await client.end();
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

/**
 * Конфигурация для Prisma
 */
export function getPrismaConfig() {
  const config = getDatabaseConfig();
  
  return {
    datasourceUrl: config.url,
    log: config.prismaLogLevel,
    errorFormat: process.env.NODE_ENV === 'production' ? 'minimal' : 'pretty',
  };
}

/**
 * Параметры для оптимизации производительности PostgreSQL
 * Эти параметры должны быть установлены на уровне сервера БД
 */
export const POSTGRESQL_OPTIMIZATION_PARAMS = {
  // Memory
  shared_buffers: '256MB', // 25% от RAM для dedicated server
  effective_cache_size: '1GB', // 50-75% от RAM
  work_mem: '4MB', // Для сортировки и хэш-таблиц
  maintenance_work_mem: '64MB', // Для VACUUM, CREATE INDEX
  
  // Checkpoint
  checkpoint_completion_target: 0.9,
  wal_buffers: '16MB',
  
  // Query Planner
  random_page_cost: 1.1, // Для SSD
  effective_io_concurrency: 200, // Для SSD
  
  // Connections
  max_connections: 200,
  
  // Logging
  log_min_duration_statement: 1000, // Логировать запросы дольше 1 сек
  log_checkpoints: 'on',
  log_connections: 'on',
  log_disconnections: 'on',
  log_temp_files: 0,
  
  // Autovacuum
  autovacuum: 'on',
  autovacuum_max_workers: 4,
  autovacuum_naptime: '30s',
  
  // Statistics
  track_counts: 'on',
  track_functions: 'all',
  track_activity_query_size: 1024,
};

export default getDatabaseConfig;
