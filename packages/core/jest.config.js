module.exports = {
    displayName: 'core',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.(ts|tsx)?$': ['ts-jest',{
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
        '\\.(gif|png|jpe?g|svg)$': '../../scripts/jest/file-transformer',
        '\\.scss$': '../../scripts/jest/style-transformer',
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/core'
};
