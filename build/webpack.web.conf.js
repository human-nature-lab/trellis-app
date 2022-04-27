const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = webpackMerge(config, {
  resolve: {
    extensions: [
      '.web.ts',
      '.web.js',
    ].concat(config.extensions),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.webpack.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: false,
        removeAttributeQuotes: false,
      },
      chunksSortMode: 'none',
    }),
    ]
})
