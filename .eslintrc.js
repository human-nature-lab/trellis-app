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
  extends: [
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended',
    'standard',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/typescript',
  ],
  // required to lint *.vue files
  plugins: [
    'import',
    'html',
    '@typescript-eslint',
  ],
  globals: {
    device: true,
    cordova: true,
  },
  settings: {
    'import/resolver': {
      webpack: {
        config: path.join(__dirname, './build/webpack.mobile.conf.js'),
      },
    },
  },
  // add your custom rules here
  rules: {
    'linebreak-style': ['warn', 'unix'],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    'max-len': ['warn', { code: 120, comments: 120 }],
    'lines-between-class-members': ['warn', 'always', { exceptAfterSingleLine: true }],
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': ['error'],
    'no-use-before-define': 'off',
    // typescript compiler has checks built into it
    '@typescript-eslint/no-use-before-define': ['error', { typedefs: false }],
    'no-undef': 0,
    'comma-dangle': ['error', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'always-multiline',
    }],
  },
}
