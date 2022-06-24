const conventionalRecommendedBump = require('conventional-recommended-bump');
const semver = require('semver');
const argv = require('yargs').argv;

const packageJson = require('../../package.json');

let nextVersion;

function getEnvArgsMap() {
    const obj = {};

    const args = argv.env && argv.env.split(' ');

    if (!args) {
        return obj;
    }

    args.forEach(arg => {
        const argArray = arg.split('=');
        obj[argArray[0]] = argArray[1];
    });

    return obj;
}

function getNextVersion() {
    if (!nextVersion) {
        nextVersion = new Promise((resolve, reject) => {
            if (argv.releaseAs) {
                return resolve(semver.clean(argv.releaseAs));
            }

            conventionalRecommendedBump({ preset: 'angular' }, (err, release) => {
                const argsObject = getEnvArgsMap();

                if (err) {
                    return reject(err);
                }

                if (argsObject.prerelease) {
                    const prereleaseType = typeof argsObject.prerelease === 'string' ? argsObject.prerelease : 'alpha';

                    return resolve(semver.inc(packageJson.version, 'prerelease', prereleaseType).replace(/\.\d+$/, `.${Date.now()}`));
                }

                resolve(semver.inc(packageJson.version, release.releaseType));
            })
        });
    }

    return nextVersion;
}

module.exports = getNextVersion;
