const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = webpackMerge({
  resolve: {
    extensions: [
      '.web.ts',
      '.web.js',
    ],
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
  ],
}, config)
