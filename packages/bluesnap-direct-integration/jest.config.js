module.exports = {
    displayName: 'bluesnap-direct-integration',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/bluesnap-direct-integration',
    coveragePathIgnorePatterns: ['./e2e', './src/mocks'],
};
