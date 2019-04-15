var path = require('path')
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var FilterWarningsPlugin = require('webpack-filter-warnings-plugin')
var webpack = require('webpack')
var SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
var CopyWebpackPlugin = require('copy-webpack-plugin')

const smp = new SpeedMeasurePlugin()
const { VueLoaderPlugin } = require('vue-loader')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = smp.wrap({
  target: 'web',
  entry: {
    app: ['@babel/polyfill', './src/main.ts']
  },
  externals: {
    config: 'config'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
    chunkFilename: '[id].[hash:8].js'
  },
  optimization: {
    // usedExports: true,
    // concatenateModules: true,
    // minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        cordova: {
          test: /\/services\/.*Cordova/,
          name: 'cordova-services',
          chunks: 'all'
        },
        web: {
          test: /\/services\/.*Web/,
          name: 'web-services',
          chunks: 'all'
        }
      },
    },
  },
  resolve: {
    extensions: ['.js', '.vue', '.json', '.ts', '.tsx', '.csv'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src')
    }
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.txt\.js$/,
        loader: 'raw-loader'
      },
      {
        test: /\.md$/,
        loader: 'raw-loader'
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          header: false,
          skipEmptyLines: true
        }
      },
      {
        test: /\.(js|vue)$/,
        use: [{
          loader: 'thread-loader',
        }, {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }],
        enforce: 'pre',
        include: [resolve('src'), resolve('test')]
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'thread-loader'
        }, {
          loader: 'ts-loader',
          options: {
            appendTsSuffixTo: [/\.vue$/],
            happyPackMode: true
          }
        }],
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: [{
          loader: 'thread-loader'
        }, {
          loader: 'vue-loader',
          options: vueLoaderConfig,
        }],
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        use: [{
          loader: 'thread-loader'
        }, {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env']
          }
        }],
        include: [resolve('src'), resolve('test')],
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins: [
    new FilterWarningsPlugin({
      exclude: [/Critical dependency/, /mongodb/, /mssql/, /mysql/, /mysql2/, /oracledb/, /pg/, /pg-native/, /pg-query-stream/, /redis/, /react-native-sqlite-storage/, /sqlite3/]
    }),
    new VueLoaderPlugin(),
    new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
      result.request = result.request.replace(/typeorm/, "typeorm/browser");
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: false
    }),
    // copy custom static assets
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, '../static'),
      to: config.build.assetsSubDirectory,
      ignore: ['.*']
    }]),
  ]
})

// var threadLoader = require('thread-loader')
// threadLoader.warmup({}, [
//   'babel-loader',
//   'sass-loader',
//   'eslint-loader'
// ])
