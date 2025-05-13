module.exports = {
  displayName: 'amazon-pay-v2-integration',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
        'ts-jest',
        {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    ],
  },
  setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/amazon-pay-v2-integration',
};
