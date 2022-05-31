const { groupBy, includes, omitBy, reduce } = require('lodash');
const { extname } = require('path');

function transformManifest(assets, appVersion) {
    const [entries] = Object.values(assets.entrypoints);
    const entrypoints = omitBy(entries.assets, (_val, key) => key.toLowerCase().endsWith('.map'));
    const entrypointPaths = reduce(entrypoints, (result, files) => [...result, ...files], []);
    const dynamicChunks = Object.values(assets).filter(path => {
        return (
            typeof path === 'string' && 
            !path.toLowerCase().endsWith('.map') &&
            !includes(entrypointPaths, path)
        );
    });
    const dynamicChunkGroups = groupBy(dynamicChunks, chunk => 
        extname(chunk).replace(/^\./, '')
    );

    return {
        version: 2,
        appVersion,
        dynamicChunks: dynamicChunkGroups,
        ...entrypoints,
    };
}

module.exports = transformManifest;
