module.exports = {
    displayName: 'bigcommerce-payments-utils',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/bigcommerce-payments-utils',
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/index.ts', '!src/**/*/index.ts'],
};
