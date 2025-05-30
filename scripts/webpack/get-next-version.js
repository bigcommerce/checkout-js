const conventionalRecommendedBump = require('conventional-recommended-bump');
const semver = require('semver');
const argv = require('yargs').argv;

const packageJson = require('../../package.json');

let nextVersion;

function getNextVersion() {
    if (!nextVersion) {
        nextVersion = new Promise((resolve, reject) => {
            if (argv.releaseAs) {
                return resolve(semver.clean(argv.releaseAs));
            }

            conventionalRecommendedBump({ preset: 'angular' }, (err, release) => {
                const prerelease = process.env.PRERELEASE;

                if (err) {
                    return reject(err);
                }

                if (prerelease) {
                    const prereleaseType = typeof prerelease === 'string' ? prerelease : 'alpha';

                    return resolve(semver.inc(packageJson.version, 'prerelease', prereleaseType).replace(/\.\d+$/, `.${Date.now()}`));
                }

                resolve(semver.inc(packageJson.version, release.releaseType));
            })
        });
    }

    return nextVersion;
}

module.exports = getNextVersion;
