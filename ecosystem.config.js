const os = require('os');

module.exports = {
  apps: [
    {
      // Основной сервис оценки
      name: 'estimate-service',
      script: './dist/services/estimate-service/src/main.js',
      cwd: './',
      
      // Режим кластера для максимальной производительности
      instances: process.env.PM2_INSTANCES || 'max',
      exec_mode: 'cluster',
      
      // Настройки памяти
      max_memory_restart: process.env.PM2_MAX_MEMORY_RESTART || '1500M',
      
      // Переменные окружения
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        
        // Оптимизация Node.js
        NODE_OPTIONS: '--max-old-space-size=1024 --optimize-for-size',
        UV_THREADPOOL_SIZE: Math.max(4, os.cpus().length),
        
        // Worker Pool настройки
        WORKER_POOL_MIN: '2',
        WORKER_POOL_MAX: String(os.cpus().length * 2),
        WORKER_AUTO_SCALE: 'true',
        
        // Лимиты памяти
        NODE_MAX_HEAP_SIZE: '1024',
        MEMORY_WARNING_THRESHOLD: '768',
        MEMORY_CRITICAL_THRESHOLD: '896',
        
        // CPU лимиты
        CPU_MAX_USAGE: '90',
        CPU_WARNING_THRESHOLD: '70',
        CPU_CRITICAL_THRESHOLD: '85',
        
        // Таймауты
        HTTP_REQUEST_TIMEOUT: '120000',
        DB_QUERY_TIMEOUT: '30000',
        AI_GENERATION_TIMEOUT: '180000',
        
        // Redis настройки
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        REDIS_CONNECT_TIMEOUT: '10000',
        
        // Масштабирование
        SCALING_MODE: 'pm2',
        MIN_INSTANCES: '2',
        MAX_INSTANCES: '10',
        AUTO_SCALE: 'true',
      },
      
      // Переменные для разработки
      env_development: {
        NODE_ENV: 'development',
        instances: 1,
        watch: true,
        ignore_watch: ['node_modules', 'logs', '.git', 'dist'],
      },
      
      // Автоматический перезапуск
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '5s',
      
      // Логирование
      log_type: 'json',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/estimate-service-error.log',
      out_file: './logs/estimate-service-out.log',
      
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Мониторинг и метрики
      instance_var: 'INSTANCE_ID',
      vizion: true,
    },
    
    {
      // AI Assistant Service
      name: 'ai-assistant',
      script: './dist/services/ai-assistant/src/main.js',
      cwd: './',
      
      // Меньше инстансов для AI сервиса
      instances: process.env.AI_INSTANCES || Math.min(4, os.cpus().length),
      exec_mode: 'cluster',
      
      max_memory_restart: '2G',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        
        // Больше памяти для AI операций
        NODE_OPTIONS: '--max-old-space-size=2048',
        
        // AI специфичные таймауты
        AI_GENERATION_TIMEOUT: '300000', // 5 минут
        AI_ANALYSIS_TIMEOUT: '180000',   // 3 минуты
        
        // Worker настройки для AI
        WORKER_POOL_MIN: '1',
        WORKER_POOL_MAX: '4',
        WORKER_TASK_TIMEOUT: '300000',
      },
      
      autorestart: true,
      max_restarts: 5,
      min_uptime: '10s',
      
      error_file: './logs/ai-assistant-error.log',
      out_file: './logs/ai-assistant-out.log',
    },
    
    {
      // Data Collector Service
      name: 'data-collector',
      script: './dist/services/data-collector/src/main.js',
      cwd: './',
      
      instances: 2,
      exec_mode: 'cluster',
      
      max_memory_restart: '1G',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3003,
        
        // Оптимизация для I/O операций
        UV_THREADPOOL_SIZE: 8,
        
        // Таймауты для внешних API
        HTTP_CONNECT_TIMEOUT: '10000',
        HTTP_RESPONSE_TIMEOUT: '60000',
        
        // Rate limiting
        RATE_LIMIT_ENABLED: 'true',
        RATE_LIMIT_WINDOW: '60000',
        RATE_LIMIT_MAX: '100',
      },
      
      autorestart: true,
      max_restarts: 10,
      
      // Cron-like restart для обновления данных
      cron_restart: '0 3 * * *', // Перезапуск в 3 часа ночи
      
      error_file: './logs/data-collector-error.log',
      out_file: './logs/data-collector-out.log',
    },
    
    {
      // File Processor Service
      name: 'file-processor',
      script: './dist/services/file-processor-service/src/main.js',
      cwd: './',
      
      instances: process.env.FILE_PROCESSOR_INSTANCES || Math.min(3, os.cpus().length),
      exec_mode: 'cluster',
      
      max_memory_restart: '1500M',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3004,
        
        // Файловые операции
        FILE_UPLOAD_TIMEOUT: '600000',     // 10 минут
        FILE_PROCESSING_TIMEOUT: '1200000', // 20 минут
        MAX_BUFFER_SIZE: '100',             // 100MB
        
        // Worker настройки для обработки файлов
        WORKER_POOL_MIN: '1',
        WORKER_POOL_MAX: '6',
        WORKER_TASK_TIMEOUT: '600000',
      },
      
      autorestart: true,
      max_restarts: 8,
      
      error_file: './logs/file-processor-error.log',
      out_file: './logs/file-processor-out.log',
    },
    
    {
      // Real-time Service (WebSocket)
      name: 'realtime-service',
      script: './dist/services/realtime-service/src/main.js',
      cwd: './',
      
      // Fork mode для WebSocket
      instances: 1,
      exec_mode: 'fork',
      
      max_memory_restart: '1G',
      
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
        
        // WebSocket настройки
        WS_HEARTBEAT_INTERVAL: '30000',
        WS_HEARTBEAT_TIMEOUT: '60000',
        WS_MAX_CONNECTIONS: '10000',
        
        // Sticky sessions через Redis
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
      },
      
      autorestart: true,
      max_restarts: 5,
      
      error_file: './logs/realtime-error.log',
      out_file: './logs/realtime-out.log',
    }
  ],
  
  // Deploy настройки (опционально)
  deploy: {
    production: {
      user: 'deploy',
      host: process.env.DEPLOY_HOST,
      ref: 'origin/main',
      repo: 'git@github.com:your-org/estimate-service.git',
      path: '/var/www/estimate-service',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
