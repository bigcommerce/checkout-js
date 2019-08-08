module.exports = {
    coverageThreshold: {
        global: {
            branches: 50,
            functions: 50,
            lines: 50,
            statements: 50,
        },
    },
    preset: 'ts-jest',
    setupFilesAfterEnv: [
        '<rootDir>/jest-setup.ts',
    ],
    transform: {
        '\\.(gif|png|jpe?g|svg)$': '<rootDir>/scripts/jest/file-transformer',
        '\\.scss$': '<rootDir>/scripts/jest/style-transformer',
    },
    snapshotSerializers: [
        'enzyme-to-json/serializer',
    ],
    globals: {
        'ts-jest': {
            diagnostics: false,
        },
    },
};
