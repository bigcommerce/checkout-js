module.exports = {
  displayName: 'hosted-payment-integration',
  preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
  coverageDirectory: '../../coverage/packages/hosted-payment-integration',
};
