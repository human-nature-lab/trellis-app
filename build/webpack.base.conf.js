const path = require('path')
const utils = require('./utils')
const config = require('../config')
const webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')
const { VueLoaderPlugin } = require('vue-loader')
// var SentryPlugin = require('@sentry/webpack-plugin')
// var sentryRelease = require('./utils').sentryRelease()
const fs = require('fs')

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
      name: utils.assetsPath(`${dirName}/[name].[hash:8].[ext]`),
    },
  }
}

function urlLoader (dirName) {
  return {
    loader: 'url-loader',
    options: {
      limit: 4096,
      fallback: fileLoader(dirName),
    },
  }
}

const isProd = process.env.NODE_ENV === 'production'
const liveReload = !isProd
// const isProd = false
// const liveReload = false
const sourceMap = true
const useSentry = isProd && fs.existsSync('.sentryclirc')
console.log('building', isProd ? 'prod' : 'dev', useSentry ? 'with sentry' : 'without sentry')

const cssLoaders = [isProd
  ? {
      loader: MiniCssExtractPlugin.loader,
      options: {
        esModule: false,
      },
    }
  : {
      loader: 'vue-style-loader',
      options: {
        sourceMap,
      },
    }, {
  loader: 'css-loader',
  options: {
    sourceMap,
  },
}, {
  loader: 'postcss-loader',
  options: {
    sourceMap,
  },
}]

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
    DEV: !isProd,
    VERSION: JSON.stringify(require('../package').version),
  }),
  new VueLoaderPlugin(),
  new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
    result.request = result.request.replace(/typeorm/, 'typeorm/browser')
  }),
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
  }),
  // copy custom static assets
  new CopyWebpackPlugin([{
    from: resolve('static'),
    to: config.build.assetsSubDirectory,
    toType: 'dir',
    ignore: ['.*'],
  }]),
  new VuetifyLoaderPlugin(),
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash].css',
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

if (isProd) {
  plugins.splice(0, 0, new CleanWebpackPlugin())
}

// if (useSentry) {
//   plugins.push(new SentryPlugin({
//     release: sentryRelease,
//     include: 'www/',
//     urlPrefix: process.env.APP_ENV === 'ANDROID' ? '/android_asset/www/' : null
//   }))
// }

const devtool = sourceMap && 'source-map'
module.exports = {
  target: 'web',
  mode: isProd ? 'production' : 'development',
  stats: {
    children: !isProd,
  },
  entry: {
    app: ['./src/main.ts'],
  },
  externals: {
    // config: { root: 'config' },
  },
  devtool,
  output: {
    path: config.build.assetsRoot,
    filename: 'js/[name].js',
    publicPath: !liveReload
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath,
    chunkFilename: 'js/[id].[hash:8].js',
  },
  mode: isProd ? 'production' : 'development',
  optimization: {
    // usedExports: true,
    // concatenateModules: true,
    minimize: false,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        styles: {
          name: 'styles',
          test: /\.css$/,
          chunks: 'all',
          enforce: true,
        },
        cordova: {
          test: /\/services\/.*Cordova/,
          name: 'cordova-services',
          chunks: 'all',
        },
        web: {
          test: /\/services\/.*Web/,
          name: 'web-services',
          chunks: 'all',
        },
      },
    },
  },
  resolve: {
    extensions: [
      '.webpack.ts',
      '.webpack.js',
      '.esnext.tx',
      '.esnext.js',
      '.tsx',
      '.ts',
      '.mjs',
      '.js',
      '.jsx',
      '.vue',
      '.json',
      '.csv',
      '.wasm',
    ],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': resolve('src'),
      // Stupid leaflet CSS import workaround. Might be fixed in newer versions of leaflet, but I'm not opening that can of worms.
      './images/layers.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers.png'),
      './images/layers-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers-2x.png'),
      './images/marker-icon.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon.png'),
      './images/marker-icon-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon-2x.png'),
      './images/marker-shadow.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-shadow.png'),
    },
  },
  node: {
    fs: 'empty',
  },
  devServer: {
    hot: true,
    port: process.env.PORT || config.dev.port,
    host: process.env.HOST || config.dev.host || '0.0.0.0',
    before (app) {
      app.use((req, res, next) => {
        console.log(req.method, req.path)
        next()
      })
    },
  },
  module: {
    rules: [
      {
        test: /changelog.*\.md$/,
        use: [{
          loader: 'vue-loader',
        }, {
          loader: path.resolve(__dirname, '../src/webpack-loaders/markdown'),
          options: {
            rootPath: path.resolve(__dirname, '../changelog'),
            marked: {
              baseUrl: '/#/changelog/',
            },
          },
        }],
      },
      {
        test: /docs.*\.md$/,
        use: [
          {
            loader: 'vue-loader',
          },
          {
            loader: path.resolve(__dirname, '../src/webpack-loaders/markdown'),
            options: {
              rootPath: path.resolve(__dirname, '../docs'),
              marked: {
                baseUrl: '/#/documentation/',
              },
            },
          },
        ],
      },
      {
        test: /\.csv$/,
        loader: 'csv-loader',
        options: {
          header: false,
          skipEmptyLines: true,
        },
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: [urlLoader('images')],
      },
      {
        test: /\.(svg)(\?.*)?$/,
        use: [fileLoader('svg')],
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        use: [urlLoader('media')],
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/i,
        use: [urlLoader('fonts')],
      },
      {
        test: /\.vue$/,
        use: [{
          loader: 'vue-loader',
          options: {
            compilerOptions: {
              whitespace: 'condense',
            },
          },
        }],
      },
      {
        test: /\.m?jsx?$/,
        use: [{
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolveCache('babel-loader'),
          },
        }, {
          loader: 'babel-loader',
        }],
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        use: [{
          loader: 'cache-loader',
          options: {
            cacheDirectory: resolveCache('ts-loader'),
          },
        }, {
          loader: 'babel-loader',
        }, {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            appendTsSuffixTo: [
              '\\.vue$',
            ],
            happyPackMode: false,
          },
        }],
      },
      {
        test: /\.css$/,
        use: cssLoaders,
      },
      {
        test: /\.sass$/,
        use: cssLoaders.concat({
          loader: 'sass-loader',
          options: {
            sourceMap,
            sassOptions: {
              indentedSyntax: true,
            },
          },
        }),
      },
      {
        test: /\.scss$/,
        use: cssLoaders.concat({
          loader: 'sass-loader',
          options: {
            sourceMap,
          },
        }),
      },
      {
        test: /\.js$/,
        loader: require.resolve('@open-wc/webpack-import-meta-loader'),
      },
    ],
  },
  plugins,
}
