module.exports = {
  displayName: 'afterpay-integration',
  preset: '../../jest.preset.js',
  globals: {
      'ts-jest': {
          tsconfig: '<rootDir>/tsconfig.spec.json',
          diagnostics: false,
      }
  },
  setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/afterpay-integration'
};
