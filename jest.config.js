const { getJestProjects } = require('@nrwl/jest');

module.exports = {
    projects: getJestProjects(),
    testPathIgnorePatterns: ["<rootDir>/tests"]
};

