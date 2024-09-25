module.exports = {
    displayName: 'test-mocks',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]sx?$': ['ts-jest', {
            tsconfig: '<rootDir>/tsconfig.spec.json',

        }],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/test-mocks',
};
