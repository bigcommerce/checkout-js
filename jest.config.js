const { getJestProjects } = require('@nrwl/jest');

module.exports = {
    testTimeout: 10000,
    projects: getJestProjects(),
};
