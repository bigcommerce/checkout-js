module.exports = {
    displayName: 'utility',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*/index.ts'],
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/utility',
};
