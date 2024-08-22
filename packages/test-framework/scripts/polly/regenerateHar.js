// Sourced from https://gist.github.com/skimi/79f26f1ac502ac2102119347a4aca11f

const md5 = require('blueimp-md5');
const stringify = require('fast-json-stable-stringify');
const fs = require('fs');
const glob = require('glob');
const keys = require('lodash/keys');
const { EOL } = require('os');

const { matchRequestsBy } = require('../../pollyConfig');

const NormalizeRequest = require('./NormalizeRequest');

const isDryRun = process.argv.includes('--dry-run');
const filePattern = 'packages/**/e2e/**/recording.har';

glob(filePattern, (error, filePaths) => {
    if (error) {
        throw error;
    }

    filePaths.forEach((filePath, index) => {
        const file = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        let hasChanges = false;

        file.log.entries = file.log.entries.map((entry) => {
            const identifiers = {};

            keys(NormalizeRequest).forEach((key) => {
                if (!matchRequestsBy[key]) {
                    return;
                }

                if (key === 'body') {
                    if (entry.request.bodySize <= 0) {
                        return;
                    }

                    identifiers[key] = NormalizeRequest[key](
                        entry.request.postData.text,
                        matchRequestsBy[key],
                    );
                } else if (key === 'headers') {
                    if (!entry.request.headers) {
                        return;
                    }

                    identifiers[key] = NormalizeRequest[key](
                        entry.request.headers.reduce(
                            (carry, val) => ({
                                ...carry,
                                [val.name]: val.value,
                            }),
                            {},
                        ),
                        matchRequestsBy[key],
                    );
                } else {
                    identifiers[key] = NormalizeRequest[key](
                        entry.request[key],
                        matchRequestsBy[key],
                    );
                }
            });

            const newId = md5(stringify(identifiers));

            // eslint-disable-next-line no-underscore-dangle
            if (entry._id !== newId) {
                // eslint-disable-next-line no-console, no-underscore-dangle
                console.log(`from ${entry._id} to ${newId}`);

                hasChanges = true;
            }

            return {
                ...entry,
                _id: md5(stringify(identifiers)),
            };
        });

        if (hasChanges && !isDryRun) {
            // eslint-disable-next-line no-console
            console.log(`[${index + 1}/${filePaths.length}] file ${filePath}`);

            fs.writeFileSync(filePath, JSON.stringify(file, null, 2) + EOL);
        }
    });
});
