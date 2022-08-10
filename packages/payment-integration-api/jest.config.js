module.exports = {
  displayName: 'payment-integration-api',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: false,
    }
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/payment-integration-api'
};
