const conventionalRecommendedBump = require('conventional-recommended-bump');
const semver = require('semver');
const argv = require('yargs').argv;

const packageJson = require('../../package.json');

function getNextVersion() {
    return new Promise((resolve, reject) => {
        if (argv.releaseAs) {
            return resolve(semver.clean(argv.releaseAs));
        }

        conventionalRecommendedBump({ preset: 'angular' }, (err, release) => {
            if (err) {
                return reject(err);
            }

            if (argv.prerelease) {
                return resolve(semver.inc(packageJson.version, argv.prerelease));
            }

            resolve(semver.inc(packageJson.version, release.releaseType));
        })
    });
}

module.exports = getNextVersion;
