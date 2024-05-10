const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

const isProd = process.env.NODE_ENV === 'production'
const webConfig = webpackMerge({
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

if (!isProd) {
  webConfig.devServer.https = {
    key: path.resolve(__dirname, '../dev_cert.key'),
    cert: path.resolve(__dirname, '../dev_cert.crt'),
    ca: path.resolve(__dirname, '../res/cert/dev_ca.crt'),
  }
}

module.exports = webConfig
