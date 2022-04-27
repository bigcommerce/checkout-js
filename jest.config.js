module.exports = {
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 85,
            lines: 90,
            statements: 90,
        },
    },
    testPathIgnorePatterns: ["<rootDir>/tests"],
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
