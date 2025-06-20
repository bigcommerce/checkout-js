#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

try {
    if (!fs.existsSync('test-results')) {
        fs.mkdirSync('test-results');
    }

    const workspaceConfig = JSON.parse(fs.readFileSync('workspace.json', 'utf8'));
    const packages = Object.keys(workspaceConfig.projects);

    packages.forEach((packageName) => {
        const packagePath = workspaceConfig.projects[packageName];
        const junitFile = path.join(packagePath, 'test-results', 'junit.xml');

        if (fs.existsSync(junitFile)) {
            const targetDir = path.join('test-results', packageName);
            const targetFile = path.join(targetDir, 'junit.xml');

            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            fs.copyFileSync(junitFile, targetFile);
        }
    });

    console.log('Test results collected.');
} catch (error) {
    console.error('Error collecting test results:', error.message);
    process.exit(1);
}
