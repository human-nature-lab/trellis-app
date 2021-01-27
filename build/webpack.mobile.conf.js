const path = require('path')
const express = require('express')
const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HandlebarsPlugin = require('handlebars-webpack-plugin')

function mobileOnly (cb) {
  return (req, res) => {
    if (req.hostname.includes('localhost')) {
      return res.send('Error: Not a device')
    }
    cb(req, res)
  }
}

module.exports = webpackMerge(config, {
  mode: 'production',
  devServer: {
    before (app, server, compiler) {
      app.get('/cordova.js', mobileOnly((req, res) => {
        res.sendFile(path.join(__dirname, '../platforms/android/platform_www/cordova.js'))
      }))
      app.get('/cordova_plugins.js', (req, res) => {
        res.sendFile(path.join(__dirname, '../platforms/android/platform_www/cordova_plugins.js'))
      })
      app.use('/plugins', express.static(path.join(__dirname, '../platforms/android/platform_www/plugins')))
    }
  },
  plugins: [
    new HandlebarsPlugin({
      data: require('../config/config-xml.data.dev'),
      entry: path.join(__dirname, '../src/config.xml.hbs'),
      output: path.join(__dirname, '../www/config.xml')
    })
  ]
})
