module.exports = {
    coverageThreshold: {
        global: {
            branches: 75.30,
            functions: 75.60,
            lines: 80.90,
            statements: 80.70,
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
