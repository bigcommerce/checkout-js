module.exports = {
    displayName: 'bluesnap-direct-integration',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/bluesnap-direct-integration',
    coveragePathIgnorePatterns: ['./e2e', './src/mocks'],
};
