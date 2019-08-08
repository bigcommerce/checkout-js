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
    snapshotSerializers: [
        'enzyme-to-json/serializer',
    ],
    globals: {
        'ts-jest': {
            diagnostics: false,
        },
    },
};
