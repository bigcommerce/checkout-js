// eslint-disable-next-line import/no-internal-modules
const nxPreset = require('@nrwl/jest/preset');

module.exports = {
    ...nxPreset,
    testPathIgnorePatterns: ['<rootDir>/e2e/'],
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    reporters: ['default', 'jest-junit'],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        '\\.(gif|png|jpe?g|svg)$': '../../scripts/jest/file-transformer',
        '\\.scss$': '../../scripts/jest/style-transformer',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    snapshotSerializers: ['enzyme-to-json/serializer'],
};
