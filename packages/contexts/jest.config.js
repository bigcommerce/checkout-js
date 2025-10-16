module.exports = {
    displayName: 'contexts',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*/index.ts', '!src/icon/*.tsx'],
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/contexts',
};
