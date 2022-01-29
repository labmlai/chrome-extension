const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')
var MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin")

module.exports = merge(common, {
    devtool: 'inline-source-map',
    mode: 'production',
    plugins: [
        new MergeJsonWebpackPlugin({
            files: ['./manifest.json', './manifest.prod.json'],
            output: {
                fileName: "../manifest.json",
            },
        })
    ],
})
