const CircularDependencyPlugin = require('circular-dependency-plugin');
const EventEmitter = require('events');
const { copyFileSync } = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { join } = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const { DefinePlugin } = require('webpack');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const { AsyncHookPlugin,
    BuildHookPlugin,
    getLoaderPackages: { aliasMap: alias, tsLoaderIncludes },
    getNextVersion,
    transformManifest } = require('./scripts/webpack');

const ENTRY_NAME = 'checkout';
const LIBRARY_NAME = 'checkout';
const AUTO_LOADER_ENTRY_NAME = 'auto-loader';
const LOADER_ENTRY_NAME = 'loader';
const LOADER_LIBRARY_NAME = 'checkoutLoader';
const BABEL_PRESET_ENV_CONFIG = {
    corejs: '3',
    targets: {
        browsers: [
            'last 2 versions',
            'not ie < 11',
            'not Baidu > 0',
            'not QQAndroid > 0',
            'not Android < 62',
        ],
    },
    useBuiltIns: 'usage',
    modules: false,
};

const eventEmitter = new EventEmitter();

function appConfig(options, argv) {
    const mode = argv.mode || 'production';
    const isProduction = mode !== 'development';
    const outputFilename = `[name]${isProduction ? '-[contenthash:8]' : ''}`;

    return (isProduction ? getNextVersion() : Promise.resolve('dev'))
        .then(appVersion => {
            return {
                entry: {
                    [ENTRY_NAME]: [
                        join(__dirname, 'packages', 'core','src', 'app', 'polyfill.ts'),
                        join(__dirname, 'packages', 'core','src', 'app', 'index.ts'),
                    ],
                },
                mode,
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
                            },
                            polyfill: {
                                test: /\/node_modules\/core-js/,
                                reuseExistingChunk: true,
                                enforce: true,
                            },
                            transients: {
                                test: /\/node_modules\/@bigcommerce/,
                                reuseExistingChunk: true,
                                enforce: true,
                            },
                            sentry: {
                                test: /\/node_modules\/@sentry/,
                                reuseExistingChunk: true,
                                enforce: true,
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
                    isProduction && new MiniCssExtractPlugin({
                        filename: `${outputFilename}.css`,
                        chunkFilename: `${outputFilename}.css`,
                    }),
                    new CircularDependencyPlugin({
                        exclude: /.*\.spec\.tsx?/,
                        include: /packages\/core\/src\/app/,
                    }),
                    new WebpackAssetsManifest({
                        entrypoints: true,
                        transform: assets => transformManifest(assets, appVersion),
                        output: 'manifest.json'
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
                            test: /\.[tj]sx?$/,
                            enforce: 'pre',
                            loader: require.resolve('source-map-loader'),
                        },
                        {
                            test: /\.tsx?$/,
                            include: tsLoaderIncludes,
                            use: [
                                {
                                    loader: 'ts-loader',
                                    options: {
                                        onlyCompileBundledFiles: true,
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
                                    loader: 'babel-loader',
                                    options: {
                                        cacheDirectory: true,
                                        presets: [
                                            ['@babel/preset-env', {
                                                ...BABEL_PRESET_ENV_CONFIG,
                                                useBuiltIns: 'entry',
                                            }],
                                        ],
                                    },
                                },
                            ],
                        },
                        {
                            test: /\.js$/,
                            loader: 'babel-loader',
                            include: join(__dirname, 'node_modules'),
                            exclude: [
                                /\/node_modules\/core-js\//,
                                /\/node_modules\/webpack\//,
                            ],
                            options: {
                                presets: [
                                    ['@babel/preset-env', BABEL_PRESET_ENV_CONFIG],
                                ],
                                sourceType: 'unambiguous',
                            },
                        },
                        {
                            test: /\.scss$/,
                            use: [
                                isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                                'css-loader',
                                'sass-loader',
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

    return (isProduction ? getNextVersion() : Promise.resolve('dev'))
        .then(appVersion => {
            return {
                entry: {
                    [LOADER_ENTRY_NAME]: join(__dirname,  'packages', 'core','src', 'app', 'loader.ts'),
                    [AUTO_LOADER_ENTRY_NAME]: join(__dirname,  'packages', 'core', 'src', 'app', 'auto-loader.ts'),
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
                                        MANIFEST_JSON: JSON.stringify(require(
                                          join(__dirname, isProduction ? 'dist' : 'build', 'manifest.json')
                                        )),
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
                            copyFileSync(`${folder}/${LOADER_ENTRY_NAME}-${appVersion}.js`, `${folder}/${LOADER_ENTRY_NAME}.js`);
                            copyFileSync(`${folder}/${AUTO_LOADER_ENTRY_NAME}-${appVersion}.js`, `${folder}/${AUTO_LOADER_ENTRY_NAME}.js`);
                        },
                    }),
                ],
                module: {
                    rules: [
                        {
                            test: /\.[tj]sx?$/,
                            enforce: 'pre',
                            loader: require.resolve('source-map-loader'),
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
                                    loader: 'babel-loader',
                                    options: {
                                        cacheDirectory: true,
                                        presets: [
                                            ['@babel/preset-env', BABEL_PRESET_ENV_CONFIG],
                                        ],
                                    },
                                },
                                {
                                    loader: 'ts-loader',
                                    options: {
                                        onlyCompileBundledFiles: true,
                                    },
                                },
                            ],
                        },
                        {
                            test: /\.js$/,
                            loader: 'babel-loader',
                            include: join(__dirname, 'node_modules'),
                            exclude: [
                                /\/node_modules\/core-js\//,
                                /\/node_modules\/webpack\//,
                            ],
                            options: {
                                presets: [
                                    ['@babel/preset-env', BABEL_PRESET_ENV_CONFIG],
                                ],
                                sourceType: 'unambiguous',
                            },
                        },
                    ],
                },
            };
        });
}

module.exports = function (options, argv) {
    return Promise.all([
        appConfig(options, argv),
        loaderConfig(options, argv),
    ]);
}
