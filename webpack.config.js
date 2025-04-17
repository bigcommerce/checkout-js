const CircularDependencyPlugin = require('circular-dependency-plugin');
const EventEmitter = require('events');
const { copyFileSync } = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join } = require('path');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const { DefinePlugin } = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const smp = new SpeedMeasurePlugin({
    // Options go here
    disable: false, // Set to true to disable the plugin (useful for CI or production)
    outputFormat: 'human', // 'json', 'human', 'humanVerbose', or a function
    outputTarget: console.log, // Where to output data (console.log, filepath string, or function)
    // ... other less common options (see plugin docs for details)
});

const {
    AsyncHookPlugin,
    BuildHookPlugin,
    getLoaderPackages: { aliasMap: alias, tsLoaderIncludes },
    getNextVersion,
    mergeManifests,
    transformManifest,
} = require('./scripts/webpack');

const ENTRY_NAME = 'checkout';
const LIBRARY_NAME = 'checkout';
const AUTO_LOADER_ENTRY_NAME = 'auto-loader';
const LOADER_ENTRY_NAME = 'loader';
const LOADER_LIBRARY_NAME = 'checkoutLoader';
const PRELOAD_ASSETS = ['billing', 'shipping', 'payment'];

const eventEmitter = new EventEmitter();

function appConfig(options, argv) {
    const mode = argv.mode || 'production';
    const isProduction = mode !== 'development';
    const outputFilename = `[name]${isProduction ? '-[contenthash:8]' : ''}`;

    return (isProduction ? getNextVersion() : Promise.resolve('dev')).then((appVersion) => {
        return {
            entry: {
                [ENTRY_NAME]: [
                    join(__dirname, 'packages', 'core', 'src', 'app', 'polyfill.ts'),
                    join(__dirname, 'packages', 'core', 'src', 'app', 'index.ts'),
                ],
            },
            mode,
            cache: {
                type: 'filesystem',
            },
            devtool: isProduction ? 'source-map' : 'eval-source-map',
            resolve: {
                alias,
                extensions: ['.ts', '.tsx', '.js'],
                // It seems some packages, i.e.: Formik, have incorrect
                // source maps for their ESM bundle. Therefore, until that
                // issue is fixed, we prefer to resolve packages using the
                // `main` field rather `module` field.
                mainFields: ['browser', 'main', 'module'],
            },
            optimization: {
                runtimeChunk: 'single',
                minimizer: [
                    (compiler) => {
                        // eslint-disable-next-line global-require
                        const TerserPlugin = require('terser-webpack-plugin');

                        new TerserPlugin({
                            extractComments: false,
                            terserOptions: {
                                sourceMap: true,
                            },
                        }).apply(compiler);
                    },
                ],
                splitChunks: {
                    chunks: 'all',
                    cacheGroups: {
                        vendors: {
                            test: /\/node_modules\//,
                            reuseExistingChunk: true,
                            enforce: true,
                            priority: -10,
                            name: 'vendors',
                        },
                        polyfill: {
                            test: /\/node_modules\/core-js/,
                            reuseExistingChunk: true,
                            enforce: true,
                            name: 'polyfill',
                        },
                        transients: {
                            test: /\/node_modules\/@bigcommerce/,
                            reuseExistingChunk: true,
                            enforce: true,
                            name: 'transients',
                        },
                        sentry: {
                            test: /\/node_modules\/@sentry/,
                            reuseExistingChunk: true,
                            enforce: true,
                            name: 'sentry',
                        },
                    },
                },
            },
            output: {
                path: isProduction ? join(__dirname, 'dist') : join(__dirname, 'build'),
                filename: `${outputFilename}.js`,
                chunkFilename: `${outputFilename}.js`,
                chunkLoadingGlobal: 'webpackJsonpCheckout',
                library: LIBRARY_NAME,
            },
            plugins: [
                new StyleLintPlugin({
                    fix: !isProduction,
                    cache: true,
                    cacheLocation: join(process.cwd(), 'node_modules/.cache/'),
                    emitErrors: isProduction,
                }),
                isProduction &&
                    new MiniCssExtractPlugin({
                        filename: `${outputFilename}.css`,
                        chunkFilename: `${outputFilename}.css`,
                    }),
                new CircularDependencyPlugin({
                    exclude: /.*\.spec\.tsx?/,
                    include: /packages\/core\/src\/app/,
                }),
                new WebpackAssetsManifest({
                    entrypoints: true,
                    transform: (assets) => transformManifest(assets, appVersion),
                    output: 'manifest-app.json',
                    integrity: isProduction,
                }),
                new BuildHookPlugin({
                    onSuccess() {
                        eventEmitter.emit('app:done');
                    },
                    onError(errors) {
                        eventEmitter.emit('app:error', errors);
                    },
                }),
            ].filter(Boolean),
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        include: tsLoaderIncludes,
                        use: [
                            {
                                loader: 'ts-loader',
                                options: {
                                    onlyCompileBundledFiles: true,
                                    // transpileOnly: true,
                                },
                            },
                        ],
                    },
                    {
                        test: /app\/polyfill\.ts$/,
                        include: [
                            join(__dirname, 'packages', 'core', 'src'),
                            join(__dirname, 'packages', 'locale', 'src'),
                            join(__dirname, 'packages', 'test-mocks', 'src'),
                        ],
                        use: [
                            {
                                loader: 'thread-loader',
                                options: {
                                    workers: 2,
                                },
                            },
                            {
                                loader: 'esbuild-loader',
                                options: {
                                    target: 'es2015', // Matches the Babel preset-env targets.
                                    loader: 'ts', // Handles TypeScript files.
                                    legalComments: 'none', // Removes comments for cleaner output.
                                },
                            },
                        ],
                    },
                    {
                        test: /\.scss$/,
                        use: [
                            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                            'css-loader',
                            {
                                loader: 'sass-loader',
                                options: {
                                    // eslint-disable-next-line global-require
                                    implementation: require('sass'),
                                    sassOptions: {
                                        logger: {
                                            warn: (message, sassOptions) => {
                                                // Ignore warnings from the Sass compiler from node modules
                                                const sourcePath =
                                                    sassOptions?.span?.url?.toString();

                                                if (
                                                    sourcePath &&
                                                    sourcePath.includes('node_modules')
                                                ) {
                                                    return;
                                                }

                                                console.warn(`Sass Warning: ${message}`);

                                                if (options?.deprecation) {
                                                    console.warn(`Deprecation: ${sassOptions}`);
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                        sideEffects: true,
                    },
                    {
                        test: /\.(gif|png|jpe?g|svg)$/i,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    name: `${outputFilename}.[ext]`,
                                    outputPath: 'static',
                                },
                            },
                            {
                                loader: 'image-webpack-loader',
                                options: {
                                    disable: true,
                                },
                            },
                        ],
                    },
                ],
            },
        };
    });
}

function loaderConfig(options, argv) {
    const mode = argv.mode || 'production';
    const isProduction = mode !== 'development';

    return (isProduction ? getNextVersion() : Promise.resolve('dev')).then((appVersion) => {
        return {
            entry: {
                [LOADER_ENTRY_NAME]: join(__dirname, 'packages', 'core', 'src', 'app', 'loader.ts'),
                [AUTO_LOADER_ENTRY_NAME]: join(
                    __dirname,
                    'packages',
                    'core',
                    'src',
                    'app',
                    'auto-loader.ts',
                ),
            },
            mode,
            devtool: isProduction ? 'source-map' : 'eval-source-map',
            resolve: {
                alias,
                extensions: ['.ts', '.tsx', '.js'],
                mainFields: ['module', 'browser', 'main'],
            },
            output: {
                path: isProduction ? join(__dirname, 'dist') : join(__dirname, 'build'),
                filename: `[name]-${appVersion}.js`,
                library: LOADER_LIBRARY_NAME,
            },
            plugins: [
                new AsyncHookPlugin({
                    onRun({ compiler, done }) {
                        let wasTriggeredBefore = false;

                        eventEmitter.on('app:done', () => {
                            if (!wasTriggeredBefore) {
                                const definePlugin = new DefinePlugin({
                                    LIBRARY_NAME: JSON.stringify(LIBRARY_NAME),
                                    PRELOAD_ASSETS: JSON.stringify(PRELOAD_ASSETS),
                                    MANIFEST_JSON: JSON.stringify(
                                        require(join(
                                            __dirname,
                                            isProduction ? 'dist' : 'build',
                                            'manifest-app.json',
                                        )),
                                    ),
                                });

                                definePlugin.apply(compiler);
                                eventEmitter.emit('loader:done');
                                done();

                                wasTriggeredBefore = true;
                            }
                        });

                        eventEmitter.on('app:error', () => {
                            eventEmitter.emit('loader:error');
                            done();
                        });
                    },
                }),
                new BuildHookPlugin({
                    onSuccess() {
                        const folder = isProduction ? 'dist' : 'build';

                        copyFileSync(
                            `${folder}/${LOADER_ENTRY_NAME}-${appVersion}.js`,
                            `${folder}/${LOADER_ENTRY_NAME}.js`,
                        );
                        copyFileSync(
                            `${folder}/${AUTO_LOADER_ENTRY_NAME}-${appVersion}.js`,
                            `${folder}/${AUTO_LOADER_ENTRY_NAME}.js`,
                        );
                    },
                }),
                new WebpackAssetsManifest({
                    entrypoints: true,
                    transform: (assets) => transformManifest(assets, appVersion),
                    output: 'manifest-loader.json',
                    integrity: isProduction,
                    done(_, { compilation: { errors = [] } }) {
                        if (errors.length) {
                            return;
                        }

                        const folder = isProduction ? 'dist' : 'build';

                        mergeManifests(
                            join(__dirname, folder, 'manifest.json'),
                            join(__dirname, folder, 'manifest-app.json'),
                            join(__dirname, folder, 'manifest-loader.json'),
                        );
                    },
                }),
            ],
            module: {
                rules: [
                    {
                        test: /\.[tj]sx?$/,
                        enforce: 'pre',
                        loader: require.resolve('source-map-loader'),
                        exclude: /node_modules/,
                    },
                    {
                        test: /\.tsx?$/,
                        include: [
                            join(__dirname, 'packages', 'core', 'src'),
                            join(__dirname, 'packages', 'dom-utils', 'src'),
                            join(__dirname, 'packages', 'legacy-hoc', 'src'),
                            join(__dirname, 'packages', 'locale', 'src'),
                            join(__dirname, 'packages', 'test-mocks', 'src'),
                        ],
                        use: [
                            {
                                loader: 'thread-loader',
                                options: {
                                    workers: 2,
                                },
                            },
                            {
                                loader: 'esbuild-loader',
                                options: {
                                    loader: 'tsx', // Supports TypeScript and JSX
                                    target: 'es2015', // Matches the targets from BABEL_PRESET_ENV_CONFIG
                                    legalComments: 'none', // Removes comments from the output
                                },
                            },
                        ],
                    },
                ],
            },
        };
    });
}

module.exports = async function (options, argv) {
    const isMeasureSpeed = process.env.MEASURE_SPEED === 'true';

    const app = appConfig(options, argv);
    const loader = loaderConfig(options, argv);

    const configArr = await Promise.all([app, loader]);

    if (isMeasureSpeed) {
        return smp.wrap(configArr);
    }

    return configArr;
};
