const { exec } = require('child_process');
const { omitBy } = require('lodash');
const { join } = require('path');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const WebpackAssetsManifest = require('webpack-assets-manifest');

const babelOptions = {
    cacheDirectory: true,
    plugins: [
        '@babel/plugin-syntax-dynamic-import',
    ],
    presets: [
        ['@babel/preset-env', {
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
        }],
    ],
};

module.exports = function (options, argv) {
    const mode = argv.mode || 'development';
    const isProduction = mode !== 'development';

    return {
        entry: {
            'checkout': join(__dirname, 'src', 'app', 'index.ts'),
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
            jsonpFunction: 'webpackJsonpCheckout',
            library: 'checkout',
            libraryTarget: 'umd',
        },
        plugins: [
            new StyleLintPlugin({
                fix: !isProduction,
                cache: true,
                cacheLocation: join(process.cwd(), 'node_modules/.cache/'),
                emitErrors: isProduction,
            }),
            isProduction && new MiniCssExtractPlugin({
                filename: `[name]${isProduction ? '-[contenthash:8]' : ''}.css`,
                chunkFilename: `[name]${isProduction ? '-[contenthash:8]' : ''}.css`,
            }),
            new WebpackAssetsManifest({
                entrypoints: true,
                transform: assets => transformManifest(assets, options),
            }),
            new ForkTsCheckerWebpackPlugin({
                async: !isProduction,
                tslint: true,
            }),
            new ForkTsCheckerWebpackPlugin({
                async: !isProduction,
                eslint: true,
            }),
            !isProduction && new BuildHooks(),
        ].filter(Boolean),
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    include: join(__dirname, 'src'),
                    use: [
                        {
                            loader: 'babel-loader',
                            options: babelOptions,
                        },
                        {
                            loader: 'ts-loader',
                            options: {
                                onlyCompileBundledFiles: true,
                                transpileOnly: true,
                            },
                        },
                    ],
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
                                name: `[name]${isProduction ? '-[contenthash:8]' : ''}.[ext]`,
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
                isProduction && {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    include: join(__dirname, 'node_modules'),
                    exclude: [
                        // These two need to be exclued:
                        // core-js: contains the polyfills
                        // webpack: prevents loaders and other file types (scss) from being processed
                        /\/node_modules\/core-js\//,
                        /\/node_modules\/webpack\//,
                    ],
                    options: {
                        ...babelOptions,
                        sourceType: 'unambiguous',
                    }
               },
            ].filter(Boolean),
        },
    };
};

function transformManifest(assets, options) {
    const [entries] = Object.values(assets.entrypoints);
    const entrypoints = omitBy(entries, (_val, key) => key.toLowerCase().endsWith('.map'));

    return {
        version: 2,
        appVersion: 'dev',
        ...entrypoints,
    };
}

class BuildHooks {
    apply(compiler) {
        if (process.env.WEBPACK_DONE) {
            compiler.hooks.done.tapPromise('BuildHooks', this.process(process.env.WEBPACK_DONE));
        }
    }

    process(command) {
        return () => new Promise((resolve, reject) => {
            exec(command, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }

                if (stderr) {
                    reject(new Error(stderr));
                }

                const cleanOutput = stdout.trim();

                if (cleanOutput) {
                    console.log(cleanOutput.replace(/^/gm, '❯ '));
                }

                resolve();
            });
        });
    }
};
