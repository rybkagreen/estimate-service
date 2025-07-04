const nxPreset = require('@nx/jest/preset').default;

module.exports = { 
  ...nxPreset,
  setupFilesAfterEnv: ['<rootDir>/../../../jest.setup.js'],
  moduleNameMapping: {
    '^canvas$': '<rootDir>/../../../jest-mocks/canvas.js',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/archive/',
    '/dist/',
    '/coverage/',
    '/src/generated/',
  ],
};
