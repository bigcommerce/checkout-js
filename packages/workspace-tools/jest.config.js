module.exports = {
  displayName: 'workspace-tools',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', {
        tsconfig: '<rootDir>/tsconfig.spec.json',
    }],
},
  coverageDirectory: '../../coverage/packages/workspace-tools'
};
