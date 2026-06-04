module.exports = {
    displayName: 'ui',
    preset: '../../jest.preset.js',
    transform: {
        'node_modules/(@intl-tel-input|intl-tel-input)/.+\\.js$': ['babel-jest', {
            presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }]],
        }],
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*/index.ts', '!src/icon/*.tsx'],
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/ui',
};
