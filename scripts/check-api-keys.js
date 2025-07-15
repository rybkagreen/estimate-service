#!/usr/bin/env node

/**
 * Скрипт для проверки конфигурации API ключей
 * Использование: node scripts/check-api-keys.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Загружаем переменные окружения
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error('❌ Файл .env не найден!');
  console.log('Создайте .env файл на основе .env.example');
  process.exit(1);
}

// Конфигурация проверок
const apiConfigs = [
  {
    name: 'DeepSeek API',
    keys: ['DEEPSEEK_API_KEY', 'DEEPSEEK_MODEL', 'DEEPSEEK_BASE_URL'],
    validate: (key, value) => {
      if (key === 'DEEPSEEK_API_KEY') {
        return value && value.startsWith('sk-') && value.length > 20;
      }
      return !!value;
    }
  },
  {
    name: 'Hugging Face API',
    keys: ['HUGGINGFACE_API_KEY', 'HF_TOKEN'],
    optional: true,
    validate: (key, value) => {
      if (!value) return true; // Optional
      return value.startsWith('hf_') && value.length > 10;
    }
  },
  {
    name: 'ФСБЦ API',
    keys: ['FSBC_API_KEY', 'FSBC_API_SECRET', 'FSBC_API_URL', 'FSBC_REGION_CODE'],
    optional: true,
    validate: (key, value) => {
      if (!value) return true; // Optional
      if (key === 'FSBC_REGION_CODE') {
        return /^\d{2,3}$/.test(value);
      }
      return value.length > 0;
    }
  },
  {
    name: 'Grand Smeta API',
    keys: ['GRAND_SMETA_API_KEY', 'GRAND_SMETA_API_URL'],
    optional: true,
    validate: (key, value) => !!value || true // Optional
  },
  {
    name: 'MCP Server',
    keys: ['MCP_SERVER_PORT', 'MCP_SERVER_HOST', 'MCP_LOG_LEVEL'],
    validate: (key, value) => {
      if (key === 'MCP_SERVER_PORT') {
        const port = parseInt(value);
        return port > 0 && port < 65536;
      }
      if (key === 'MCP_LOG_LEVEL') {
        return ['error', 'warn', 'info', 'debug'].includes(value);
      }
      return !!value;
    }
  },
  {
    name: 'Security',
    keys: ['JWT_SECRET', 'MASTER_API_KEY', 'ENCRYPTION_KEY'],
    validate: (key, value) => value && value.length >= 32
  },
  {
    name: 'Database',
    keys: ['DATABASE_URL'],
    validate: (key, value) => value && value.startsWith('postgresql://')
  }
];

// Функция проверки
function checkApiKeys() {
  console.log('🔍 Проверка конфигурации API ключей...\n');
  
  let hasErrors = false;
  let hasWarnings = false;

  apiConfigs.forEach(config => {
    console.log(`📦 ${config.name}:`);
    
    config.keys.forEach(key => {
      const value = process.env[key];
      const isValid = config.validate ? config.validate(key, value) : !!value;
      
      if (!value) {
        if (config.optional) {
          console.log(`  ⚠️  ${key}: не установлен (опционально)`);
          hasWarnings = true;
        } else {
          console.log(`  ❌ ${key}: НЕ УСТАНОВЛЕН`);
          hasErrors = true;
        }
      } else if (!isValid) {
        console.log(`  ❌ ${key}: НЕВАЛИДНОЕ ЗНАЧЕНИЕ`);
        hasErrors = true;
      } else {
        // Маскируем значение для безопасности
        const maskedValue = maskValue(key, value);
        console.log(`  ✅ ${key}: ${maskedValue}`);
      }
    });
    
    console.log('');
  });

  // Дополнительные проверки
  console.log('📋 Дополнительные проверки:');
  
  // Проверка NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';
  console.log(`  ℹ️  NODE_ENV: ${nodeEnv}`);
  
  // Проверка портов
  const ports = [
    { name: 'API Port', key: 'PORT', default: '3022' },
    { name: 'MCP Server Port', key: 'MCP_SERVER_PORT', default: '3333' }
  ];
  
  ports.forEach(({ name, key, default: defaultValue }) => {
    const port = process.env[key] || defaultValue;
    console.log(`  ℹ️  ${name}: ${port}`);
  });

  console.log('\n' + '='.repeat(50));
  
  if (hasErrors) {
    console.log('\n❌ Обнаружены критические ошибки в конфигурации!');
    console.log('Пожалуйста, установите все обязательные переменные окружения.');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('\n⚠️  Конфигурация корректна, но есть предупреждения.');
    console.log('Некоторые опциональные сервисы могут быть недоступны.');
  } else {
    console.log('\n✅ Все API ключи настроены корректно!');
  }
}

// Функция маскировки значений
function maskValue(key, value) {
  if (!value) return 'НЕ УСТАНОВЛЕН';
  
  // Для URL показываем домен
  if (value.includes('://')) {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.hostname}...`;
    } catch {
      return value.substring(0, 20) + '...';
    }
  }
  
  // Для ключей показываем первые и последние символы
  if (key.includes('KEY') || key.includes('SECRET') || key.includes('TOKEN')) {
    if (value.length > 10) {
      return value.substring(0, 6) + '...' + value.substring(value.length - 4);
    }
    return '*'.repeat(value.length);
  }
  
  // Для остальных показываем полностью
  return value;
}

// Запуск проверки
checkApiKeys();
