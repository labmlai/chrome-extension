const webpack = require('webpack')
const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const srcDir = path.join(__dirname, '..')

module.exports = {
    entry: {
        popup: [
            path.join(srcDir, 'popup', 'popup.ts'),
            path.join(srcDir, 'css', 'popup.scss'),
        ],
        background: path.join(srcDir, 'background', 'background.ts'),
        content_script: [
            path.join(srcDir, 'content_scripts', 'content.ts'),
            path.join(srcDir, 'css', 'content.scss'),
        ],
        options: [
            path.join(srcDir, 'options', 'options.ts'),
            path.join(srcDir, 'css', 'options.scss'),
        ],
    },
    output: {
        path: path.join(__dirname, '../build/js'),
        filename: '[name].js',
        clean: true,
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                default: false,
            },
        },
        minimize: false,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.scss', '.css'],
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'assets', to: '../assets' },
                { from: 'html', to: '../html' },
                { from: 'manifest.json', to: '../' },
            ],
            options: {},
        }),
        new MiniCssExtractPlugin({
            filename: '../css/[name].css',
        }),
    ],
}
