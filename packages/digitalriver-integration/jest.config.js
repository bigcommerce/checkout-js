module.exports = {
  displayName: 'digitalriver-integration',
  preset: '../../jest.preset.js',
  globals: {
      'ts-jest': {
          tsconfig: '<rootDir>/tsconfig.spec.json',
          diagnostics: false,
      },
  },
  setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/digitalriver-integration',
};
