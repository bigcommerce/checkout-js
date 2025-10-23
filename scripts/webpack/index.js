module.exports = {
    AsyncHookPlugin: require('./async-hook-plugin'),
    BuildHookPlugin: require('./build-hook-plugin'),
    getNextVersion: require('./get-next-version'),
    transformManifest: require('./transform-manifest'),
    mergeManifests: require('./merge-manifests'),
    transformLoaderManifest: require('./transform-loader-manifest'),
    getLoaderPackages: require('./get-loader-packages'),
};
