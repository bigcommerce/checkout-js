const { join } = require('path');

module.exports = function (options, argv) {
    const mode = argv.mode || 'development';
    const isProduction = mode !== 'development';

    return {
        entry: {
            'checkout': join(__dirname, 'src', 'app', 'App.ts'),
        },
        mode,
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js'],
            mainFields: ['module', 'browser', 'main'],
        },
        optimization: {
            // Can cause issues with circular dependencies
            concatenateModules: false,
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    transients: {
                        test: ({ resource }) => /\/node_modules\/@bigcommerce/.test(resource),
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                },
            },
        },
        output: {
            path: isProduction ? join(__dirname, 'dist') : join(__dirname, 'build'),
            filename: `[name]${isProduction ? '-[contenthash:8]' : ''}.js`,
            chunkFilename: `[name]${isProduction ? '-[contenthash:8]' : ''}.js`,
            jsonpFunction: 'checkout',
        },
    };
};
