'use strict';
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function () {
    return {

        debug: false,
        profile: true,
        bail: false,

        entry: {
            polyfills: [
                path.resolve(__dirname, 'node_modules/es6-shim/es6-shim.min.js'),
                path.resolve(__dirname, 'node_modules/es6-promise/dist/es6-promise.min.js'),
                path.resolve(__dirname, 'node_modules/reflect-metadata/Reflect.js'),
                path.resolve(__dirname, 'node_modules/zone.js/dist/zone.min.js'),
                path.resolve(__dirname, 'node_modules/zone.js/dist/long-stack-trace-zone.min.js')
            ]
        },

        output: {
            filename: '[name].bundle.js',
        },

        module: {
            loaders: [
                {
                    test: /\.ts$/,
                    loaders: ['angular2-template-loader', 'awesome-typescript-loader'],
                    exclude: [/\.(spec|e2e)\.ts$/]
                },
                {
                    test: /\.(html)$/,
                    loader: 'raw-loader',
                    exclude: ['app/index.html']
                },
                {
                    test: /\.(scss|css)$/,
                    loaders: ["style", "css", "sass"],
                    exclude: ['app/index.html']
                },
            ]
        },
        sassLoader: {
            includePaths: [path.resolve(__dirname, "./some-folder")]
        },
        resolve: {
            root: [path.resolve(__dirname, 'app')],
            extensions: ['', '.ts', '.js']
        },

        plugins: [
            new webpack.LoaderOptionsPlugin({
                minimize: true,
                debug: false
            }),
            new CopyWebpackPlugin([
                { from: 'node_modules/videogular2/fonts', to: 'fonts' }
            ]),
        ],

        devtool: false,

        devServer: {
            compress: true
        }

    };
};
