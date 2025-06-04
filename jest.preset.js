// eslint-disable-next-line import/no-internal-modules
const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: [
    'packages/core/src/app/payment/paymentMethod', // TODO: CHECKOUT-9099 Write tests for this folder after payment methods extraction
  ],
  reporters: ['default', 'jest-junit'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '\\.(gif|png|jpe?g|svg)$': '../../scripts/jest/file-transformer',
    '\\.scss$': '../../scripts/jest/style-transformer',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 30000,
};
