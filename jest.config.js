const { getJestProjects } = require('@nrwl/jest');

module.exports = {
    projects: getJestProjects(),
    testPathIgnorePatterns: ["<rootDir>/packages/e2e/"]
};

