const path = require('path')
const express = require('express')
const webpackMerge = require('webpack-merge')
const config = require('./webpack.base.conf')
const HandlebarsPlugin = require('handlebars-webpack-plugin')

function mobileOnly (req, res, next) {
  return (req, res) => {
    if (req.hostname.includes('localhost')) {
      return res.send('Error: Not a device')
    }
    next()
  }
}

const isProd = process.env.NODE_ENV === 'production'

module.exports = webpackMerge(config, {
  devServer: {
    before (app, server, compiler) {
      app.get('/cordova.js', mobileOnly, (req, res) => {
        res.sendFile(path.join(__dirname, '../platforms/android/platform_www/cordova.js'))
      })
      app.get('/cordova_plugins.js', mobileOnly, (req, res) => {
        res.sendFile(path.join(__dirname, '../platforms/android/platform_www/cordova_plugins.js'))
      })
      app.use('/plugins', express.static(path.join(__dirname, '../platforms/android/platform_www/plugins')))
    }
  },
  plugins: [
    new HandlebarsPlugin({
      data: require(isProd ? '../config/config-xml.prod' : '../config/config-xml.dev'),
      entry: path.join(__dirname, '../src/config.xml.hbs'),
      output: path.join(__dirname, '../www/config.xml')
    })
  ]
})