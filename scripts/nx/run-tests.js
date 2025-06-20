#!/usr/bin/env node
/* eslint-disable no-console */

const { execSync } = require('child_process');
const yargs = require('yargs');

/**
 * Script to run nx tests with package and file filtering
 *
 * Usage:
 *   node scripts/run-tests.js --projects=package-a,package-b --files="src/foo.test.ts src/bar.spec.ts"
 *   node scripts/run-tests.js --exclude=core,analytics --files="*.integration.test.ts"
 *   node scripts/run-tests.js --projects=adyen-integration,stripe-integration
 *   node scripts/run-tests.js --files="src/components/*.test.ts"
 */

function parseDelimited(delimiter) {
    return (arg) =>
        arg
            ? arg
                  .split(delimiter)
                  .map((item) => item.trim())
                  .filter(Boolean)
            : [];
}

function parseArguments() {
    const argv = yargs
        .option('projects', {
            describe: 'Include specific packages (comma-separated)',
            type: 'string',
            coerce: parseDelimited(','),
        })
        .option('exclude', {
            describe: 'Exclude specific packages (comma-separated)',
            type: 'string',
            coerce: parseDelimited(','),
        })
        .option('files', {
            describe: 'Filter test files by patterns (space or newline delimited)',
            type: 'string',
            coerce: parseDelimited(/[\s]+/),
        })
        .option('ci', {
            describe: 'Run tests in CI mode',
            type: 'boolean',
        }).argv;

    let files = argv.files || [];

    if (argv._ && argv._.length > 0) {
        const additionalFiles = argv._.filter(
            (arg) => typeof arg === 'string' && !arg.startsWith('-'),
        );

        files = [...files, ...additionalFiles];
    }

    return {
        projects: argv.projects || [],
        exclude: argv.exclude || [],
        files,
        ci: argv.ci || false,
    };
}

function getAllProjects() {
    try {
        const workspaceConfig = require('../../workspace.json');

        return Object.keys(workspaceConfig.projects);
    } catch (error) {
        console.error('Error reading workspace.json:', error.message);

        return [];
    }
}

function getProjectsToTest(config) {
    const allProjects = getAllProjects();

    if (config.projects.length > 0) {
        return config.projects;
    }

    if (config.exclude.length > 0) {
        return allProjects.filter((project) => !config.exclude.includes(project));
    }

    return allProjects;
}

function filterFilesForProject(files, projectName) {
    if (!files || files.length === 0) {
        return [];
    }

    const projectPath = `packages/${projectName}`;

    return files.filter((file) => file.includes(projectPath));
}

function buildJestCommand(projectName, config) {
    const projectPath = `packages/${projectName}`;
    const jestConfigPath = `${projectPath}/jest.config.js`;

    let command = `npx jest --config=${jestConfigPath}`;

    const projectFiles = filterFilesForProject(config.files, projectName);

    if (projectFiles.length > 0) {
        command += ` ${projectFiles.join(' ')}`;
    }

    command += ' --runInBand --passWithNoTests';

    if (config.ci) {
        command += ' --ci';
    }

    return command;
}

function main() {
    const config = parseArguments();

    if (config.projects.length > 0 && config.exclude.length > 0) {
        console.error('Error: Cannot specify both --projects and --exclude options');
        process.exit(1);
    }

    const projectsToTest = getProjectsToTest(config);
    const failedProjects = [];
    const skippedProjects = [];

    console.log(
        `Running tests for ${projectsToTest.length} projects: ${projectsToTest.join(', ')}`,
    );

    for (const project of projectsToTest) {
        if (config.files.length > 0) {
            const projectFiles = filterFilesForProject(config.files, project);

            if (projectFiles.length === 0) {
                console.log(`\n--- Skipping project: ${project} (no matching files) ---`);
                skippedProjects.push(project);
                // eslint-disable-next-line no-continue
                continue;
            }
        }

        const command = buildJestCommand(project, config);

        console.log(`\n--- Running tests for project: ${project} ---`);
        console.log(`Command: ${command}`);

        try {
            execSync(command, {
                stdio: 'inherit',
                cwd: process.cwd(),
            });
            console.log(`✓ Tests passed for project: ${project}`);
        } catch (error) {
            console.error(`✗ Tests failed for project: ${project}`);
            failedProjects.push({
                project,
                error: error.message,
                status: error.status || 1,
            });
        }
    }

    // Report final results
    console.log('\n=== Test Results Summary ===');
    console.log(`Total projects: ${projectsToTest.length}`);
    console.log(`Tested: ${projectsToTest.length - skippedProjects.length}`);
    console.log(`Skipped: ${skippedProjects.length}`);
    console.log(
        `Passed: ${projectsToTest.length - failedProjects.length - skippedProjects.length}`,
    );
    console.log(`Failed: ${failedProjects.length}`);

    if (skippedProjects.length > 0) {
        console.log(`\nSkipped projects: ${skippedProjects.join(', ')}`);
    }

    if (failedProjects.length > 0) {
        console.log('\nFailed projects:');
        failedProjects.forEach(({ project, error }) => {
            console.log(`  - ${project}: ${error}`);
        });
        process.exit(1);
    }

    console.log('\n✓ All tests passed!');
}

main();
