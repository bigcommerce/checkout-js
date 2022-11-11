module.exports = {
    displayName: 'ui',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*/index.ts', '!src/icon/*.tsx'],
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/ui',
};
