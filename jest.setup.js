// Global Jest Setup
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Configure environment
// eslint-disable-next-line no-process-env
process.env.NODE_ENV = 'test';
// eslint-disable-next-line no-process-env
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
// eslint-disable-next-line no-process-env
process.env.JWT_SECRET = 'test-jwt-secret';
// eslint-disable-next-line no-process-env
process.env.DEEPSEEK_API_KEY = 'test-deepseek-api-key';
// eslint-disable-next-line no-process-env
process.env.DEEPSEEK_MODEL = 'deepseek-r1';
// eslint-disable-next-line no-process-env
process.env.DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1';
