module.exports = {
  displayName: 'paypal-utils',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: false,
    }],
  },
  setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/paypal-utils',
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/index.ts', '!src/**/*/index.ts'],
};
