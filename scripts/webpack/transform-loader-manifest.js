const { existsSync, readFileSync } = require('fs');

function transformLoaderManifest(srcPath, preloadAssets) {
    if (!existsSync(srcPath)) {
        throw new Error('Unable to locate the source manifest file.');
    }

    const manifest = JSON.parse(readFileSync(srcPath, 'utf8'));
    const {
        appVersion,
        css = [],
        dynamicChunks: { css: cssDynamicChunks = [], js: jsDynamicChunks = [] },
        js = [],
        integrity = {},
    } = manifest;

    const result = {
        appVersion,
        css,
        js,
        dynamicChunks: {
            css: cssDynamicChunks.filter((path) =>
                preloadAssets.some((preloadPath) => path.startsWith(preloadPath)),
            ),
            js: jsDynamicChunks.filter((path) =>
                preloadAssets.some((preloadPath) => path.startsWith(preloadPath)),
            ),
        },
        integrity: Object.fromEntries([...css, ...js].map((file) => [file, integrity[file]])),
    };

    return result;
}

module.exports = transformLoaderManifest;
