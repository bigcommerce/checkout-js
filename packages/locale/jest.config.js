module.exports = {
    displayName: 'locale',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!src/index.ts',
        '!src/**/*/index.ts',
        '!src/contexts/createLocaleContext.ts',
    ],
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/locale',
};
