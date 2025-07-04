// Global Jest Setup
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock canvas for JSDOM environment
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(),
    toBuffer: jest.fn(),
    toDataURL: jest.fn(),
  })),
  createImageData: jest.fn(),
  loadImage: jest.fn(),
}));

// Configure environment
// eslint-disable-next-line no-process-env
process.env.NODE_ENV = 'test';
// eslint-disable-next-line no-process-env
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
// eslint-disable-next-line no-process-env
process.env.JWT_SECRET = 'test-jwt-secret';
