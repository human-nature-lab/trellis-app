const path = require('path')
const express = require('express')
const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')

function mobileOnly (req, res, next) {
  if (req.hostname.includes('localhost')) {
    return res.send('Error: Not a device').end()
  }
  next()
}

const isProd = process.env.NODE_ENV === 'production'
console.log('isProd', isProd, process.env.NODE_ENV, process.env.APP_ENV)
const mobileConfig = webpackMerge({
  resolve: {
    extensions: [
      '.mobile.ts',
      '.mobile.js',
    ],
  },
  devServer: {
    before (app, server, compiler) {
      app.get('/cordova.js', mobileOnly, (req, res) => {
        res.sendFile(path.join(__dirname, '../platforms/android/platform_www/cordova.js'), {}, err => {
          if (err) {
            res.status(err.status).end()
          }
        })
      })
      app.get('/cordova_plugins.js', mobileOnly, (req, res) => {
        res.sendFile(path.join(__dirname, '../platforms/android/platform_www/cordova_plugins.js'), {}, err => {
          if (err) {
            res.status(err.status).end()
          }
        })
      })
      app.use('/plugins', express.static(path.join(__dirname, '../platforms/android/platform_www/plugins')))
    },
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
  mobileConfig.devServer.https = {
    key: path.resolve(__dirname, '../dev_cert.key'),
    cert: path.resolve(__dirname, '../dev_cert.crt'),
    ca: path.resolve(__dirname, '../res/cert/dev_ca.crt'),
  }
}

module.exports = mobileConfig
