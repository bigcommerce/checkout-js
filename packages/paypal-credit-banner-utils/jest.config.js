module.exports = {
  displayName: 'paypal-credit-banner-utils',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: false,
    }],
  },
  setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/paypal-credit-banner-utils',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/index.ts', '!src/**/*/index.ts'],
};
