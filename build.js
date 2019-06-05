#!/usr/bin/env node
require('@babel/register')({
  'presets': [
    ['@babel/env', {
      'targets': {
        'node': 'current' // or '7.10.0'
      }
    }]
  ]
})
// Import the rest of our application.
module.exports = require('./build.es6.js')
