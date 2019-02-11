require('babel-register')({
  presets: [ 'env' ]
})
// Import the rest of our application.
module.exports = require('./build.es6.js')
