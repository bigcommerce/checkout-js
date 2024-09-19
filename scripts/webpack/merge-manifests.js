const { existsSync, readFileSync, writeFileSync } = require('fs');
const { isArray, mergeWith } = require('lodash');

function mergeManifests(outputPath, sourcePathA, sourcePathB) {
    if (!existsSync(sourcePathA) || !existsSync(sourcePathB)) {
        throw new Error('Unable to merge manifests as one of the sources does not exist');
    }

    const manifestA = JSON.parse(readFileSync(sourcePathA, 'utf8'));
    const manifestB = JSON.parse(readFileSync(sourcePathB, 'utf8'));

    const result = mergeWith(manifestA, manifestB, (valueA, valueB) => {
        if (!isArray(valueA) || !isArray(valueB)) {
            return undefined;
        }

        return valueA.concat(valueB);
    });

    writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
}

module.exports = mergeManifests;
