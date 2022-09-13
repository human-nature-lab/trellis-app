const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const isProd = process.env.NODE_ENV === 'production'
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
      template: isProd ? 'index.webpack.html' : 'index.webpack.dev.html',
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
