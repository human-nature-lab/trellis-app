const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')

module.exports = webpackMerge({
  resolve: {
    extensions: [
      '.web.ts',
      '.web.js',
    ],
  },
}, config)
