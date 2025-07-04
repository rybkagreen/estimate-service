const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/archive/',
    '/dist/',
    '/coverage/',
    '/src/generated/',
  ],
};
