const path = require('path')
/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
  },
  env: {
    browser: true,
  },
  // required to lint *.vue files
  plugins: [
    'import',
    'html',
  ],
  globals: {
    device: true,
    cordova: true,
  },
  // settings: {
  //   'import/resolver': {
  //     webpack: {
  //       config: path.join(__dirname, './build/webpack.mobile.conf.js'),
  //     },
  //   },
  // },
  // add your custom rules here
  rules: {
    // allow paren-less arrow functions
    'linebreak-style': ['warn', 'unix'],
  },
}
