module.exports = {
    displayName: 'squarev2-integration',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': [
            'ts-jest',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                diagnostics: false,
            },
        ],
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/squarev2-integration',
};
