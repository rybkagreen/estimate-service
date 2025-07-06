import { Config } from 'jest';

const config: Config = {
  displayName: 'Integration Tests',
  rootDir: './',
  testMatch: ['<rootDir>/test/integration/**/*.spec.ts'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
  coverageDirectory: './coverage/integration',
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 30000,
  maxWorkers: 1, // Интеграционные тесты выполняем последовательно
  forceExit: true,
  detectOpenHandles: true,
};

export default config;
