const { groupBy, includes, omitBy, reduce } = require('lodash');
const { extname } = require('path');

function transformManifest(assets, appVersion) {
    const [entries] = Object.values(assets.entrypoints);
    const entrypoints = omitBy(entries.assets, (_val, key) => key.toLowerCase().endsWith('.map'));
    const entrypointPaths = reduce(entrypoints, (result, files) => [...result, ...files], []);

    const dynamicChunks = Object.values(assets)
        .filter(({ src }) => {
            if (!src || includes(entrypointPaths, src)) {
                return false;
            }

            return src.toLowerCase().endsWith('.js') || src.toLowerCase().endsWith('.css');
        })
        .map(({ src }) => src);

    const dynamicChunkGroups = groupBy(dynamicChunks, chunk => 
        extname(chunk).replace(/^\./, '')
    );

    const integrityHashes = Object.values(assets)
        .filter(({ src }) => {
            if (!src) {
                return false;
            }

            return src.toLowerCase().endsWith('.js') || src.toLowerCase().endsWith('.css');
        })
        .reduce((result, { src, integrity }) => ({ ...result, [src]: integrity }), {});

    return {
        version: 2,
        appVersion,
        dynamicChunks: dynamicChunkGroups,
        ...entrypoints,
        integrity: integrityHashes,
    };
}

module.exports = transformManifest;
