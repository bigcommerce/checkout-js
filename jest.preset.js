// eslint-disable-next-line import/no-internal-modules
const nxPreset = require('@nx/jest/preset');

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
  coveragePathIgnorePatterns: [
    'packages/core/src/app/payment/paymentMethod', // TODO: CHECKOUT-9099 Write tests for this folder after payment methods extraction
  ],
  reporters: ['default', 'jest-junit'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest',
    '\\.(gif|png|jpe?g|svg)$': '../../scripts/jest/file-transformer',
    '\\.scss$': '../../scripts/jest/style-transformer',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  /* TODO: Update to latest Jest snapshotFormat
   * By default Nx has kept the older style of Jest Snapshot formats
   * to prevent breaking of any existing tests with snapshots.
   * It's recommend you update to the latest format.
   * You can do this by removing snapshotFormat property
   * and running tests with --update-snapshot flag.
   * Example: "nx affected --targets= --update-snapshot"
   * More info: https://jestjs.io/docs/upgrading-to-jest29#snapshot-format
   */
  snapshotFormat: { escapeString: true, printBasicPrototype: true },
};
