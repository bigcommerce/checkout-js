module.exports = {
    displayName: 'instrument-utils',
    preset: '../../jest.preset.js',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        },
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/instrument-utils',
};
