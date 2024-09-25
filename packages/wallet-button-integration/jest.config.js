module.exports = {
    displayName: 'wallet-button-integration',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',
        }],
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/wallet-button-integration',
};
