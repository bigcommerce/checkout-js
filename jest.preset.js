// eslint-disable-next-line import/no-internal-modules
const nxPreset = require('@nrwl/jest/preset');

module.exports = {
    ...nxPreset,
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    moduleFileExtensions: [
        'ts',
        'tsx',
        'js',
        'jsx',
        'json',
    ],
    snapshotSerializers: [
        'enzyme-to-json/serializer',
    ]
}
