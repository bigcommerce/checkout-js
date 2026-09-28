module.exports = {
    displayName: 'core',
    preset: '../../jest.preset.js',
    testEnvironment: 'jest-fixed-jsdom',
    transform: {
        '^.+\\.(ts|tsx)?$': ['ts-jest',{
            tsconfig: '<rootDir>/tsconfig.spec.json',
            diagnostics: false,
        }],
        '^.+\\.m?js$': ['babel-jest', {
            presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
        }],
        '\\.(gif|png|jpe?g|svg)$': '../../scripts/jest/file-transformer',
        '\\.scss$': '../../scripts/jest/style-transformer',
    },
    setupFilesAfterEnv: ['../../jest-setup.ts'],
    coverageDirectory: '../../coverage/packages/core'
};
