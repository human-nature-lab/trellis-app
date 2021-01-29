const path = require('path')
const VERSION = require('../package').version

exports.sentryRelease = function () {
  return 'trellis-' + VERSION
}

exports.assetsPath = function (_path) {
  var config = require('../config')
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}
