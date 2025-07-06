// Jest setup for estimate-service
// Global test configuration

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console.log to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  // Suppress console.log in tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;

  // Clear all mocks
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Helper for async error testing
  expectAsync: async (asyncFn) => {
    try {
      await asyncFn();
      throw new Error('Expected function to throw');
    } catch (error) {
      return error;
    }
  }
};
