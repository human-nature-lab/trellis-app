const path = require('path')
const utils = require('./utils')
const config = require('../config')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const { VueLoaderPlugin } = require('vue-loader')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

function resolveCache (dir) {
  return resolve(path.join('node_modules/.cache', dir))
}

function fileLoader (dirName) {
  return {
    loader: 'file-loader',
    options: {
      name: utils.assetsPath(`${dirName}/[name].[hash:8].[ext]`)
    }
  }
}

function urlLoader (dirName) {
  return {
    loader: 'url-loader',
    options: {
      limit: 4096,
      fallback: fileLoader(dirName)
    }
  }
}

const isProd = process.env === 'production'
const sourceMap = true

const cssLoaders = [isProd ? MiniCssExtractPlugin.loader : {
  loader: 'vue-style-loader',
  options: {
    sourceMap
  }
}, {
  loader: 'css-loader',
  options: {
    sourceMap
  }
}, {
  loader: 'postcss-loader',
  options: {
    sourceMap
  }
}]

module.exports = {
  target: 'web',
  mode: isProd ? 'production' : 'development',
  entry: {
    app: ['./src/main.ts']
  },
  externals: {
    config: 'config'
  },
  devtool: sourceMap ? 'eval' : false,
  output: {
    path: config.build.assetsRoot,
    filename: 'js/[name].js',
    publicPath: isProd
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
    chunkFilename: 'js/[id].[hash:8].js'
  },
  mode: isProd ? 'production' : 'development',
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
    extensions: [
      '.tsx',
      '.ts',
      '.mjs',
      '.js',
      '.jsx',
      '.vue',
      '.json',
      '.csv',
      '.wasm'
    ],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      // Stupid leaflet CSS import workaround. Might be fixed in newer versions of leaflet, but I'm not opening that can of worms.
      './images/layers.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers.png'),
      './images/layers-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers-2x.png'),
      './images/marker-icon.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon.png'),
      './images/marker-icon-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon-2x.png'),
      './images/marker-shadow.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-shadow.png')
    }
  },
  node: {
    fs: 'empty'
  },
  devServer: {
    hot: true,
    compress: true,
    port: process.env.PORT || config.dev.port,
    host: process.env.HOST || config.dev.host || '0.0.0.0'
  },
  module: {
    rules: [
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
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [urlLoader('images')]
      },
      {
        test: /\.(svg)(\?.*)?$/,
        use: [fileLoader('svg')]
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [urlLoader('media')]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [urlLoader('fonts')]
      },
      {
        test: /\.vue$/,
        use: [{
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolveCache('vue-loader'),
          }
        }, {
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              whitespace: 'condense'
            }
          },
        }]
      },
      {
        test: /\.m?jsx?$/,
        use: [{
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolveCache('babel-loader')
          }
        }, {
          loader: 'babel-loader'
        }],
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolveCache('ts-loader')
          }
        }, {
          loader: 'babel-loader'
        }, {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            appendTsSuffixTo: [
              '\\.vue$'
            ],
            happyPackMode: false
          }
        }]
      },
      {
        test: /\.css$/,
        use: cssLoaders
      },
      {
        test: /\.sass$/,
        use: cssLoaders.concat({
          loader: 'sass-loader',
          options: {
            sourceMap,
            sassOptions: {
              indentedSyntax: true
            }
          }
        })
      },
      {
        test: /\.scss$/,
        use: cssLoaders.concat({
          loader: 'sass-loader',
          options: {
            sourceMap
          }
        })
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env),
      VERSION: JSON.stringify(require('../package').version)
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
      from: resolve('static'),
      to: config.build.assetsSubDirectory,
      toType: 'dir',
      ignore: ['.*']
    }]),
    new VuetifyLoaderPlugin(),
    new HtmlWebpackPlugin({
      filename: config.build.index,
      template: 'index.html',
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
      },
      chunksSortMode: 'none'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFileName: '[id].css'
    }),
    // new ForkTsCheckerWebpackPlugin({
    //   typescript: {
    //     extensions: {
    //       vue: {
    //         enabled: true,
    //         compiler: 'vue-template-compiler'
    //       }
    //     }
    //   }
    // })
  ]
}
