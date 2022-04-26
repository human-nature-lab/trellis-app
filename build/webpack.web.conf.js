const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')

module.exports = webpackMerge(config, {
  resolve: {
    extensions: [
      '.web.ts',
      '.web.js',
    ].concat(config.extensions),
  },
})
