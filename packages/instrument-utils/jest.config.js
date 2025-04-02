module.exports = {
    displayName: 'instrument-utils',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/instrument-utils',
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/index.ts', '!src/**/*/index.ts'],
};
