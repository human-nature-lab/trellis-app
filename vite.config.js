
import path from 'path'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import markdown from './src/vite-plugins/markdown'
import handlebars from './src/vite-plugins/handlebars'
import cordova from './src/vite-plugins/cordova'
// import { esbuildPluginTsc } from 'esbuild-plugin-tsc'
// import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs'

process.env.TARGET = process.env.TARGET || 'web'
process.env.APP_ENV = process.env.APP_ENV || 'web'
const isCordova = process.env.TARGET.toLowerCase() === 'cordova' || process.env.APP_ENV.toLowerCase() === 'cordova'

const resolve = (p) => path.resolve(__dirname, p)
const SRC_DIR = resolve('./src')
const PUBLIC_DIR = resolve('./static')
const BUILD_DIR = resolve('./www')

export default defineConfig(({ command, mode }) => {
  console.log(`command: ${command}, mode: ${mode}, target: ${process.env.TARGET}`, isCordova ? 'cordova' : 'web')
  const isProd = mode === 'production'
  const config = {
    // logLevel: 'warn',
    // esbuild: false,
    plugins: [
      // viteCommonjs({ include}),
      // esbuildPluginTsc({ force: true }),
      createVuePlugin({
        target: 'es5',
        include: [/\.vue$/, /\.md$/],
      }),
      markdown(),
      handlebars({
        context: require(isProd ? './config/config-xml.prod' : './config/config-xml.dev'),
        entryFile: path.join(__dirname, 'src/config.xml.hbs'),
      }),
      cordova(),
    ],
    define: {
      'process.env': process.env,
      VERSION: JSON.stringify(require('./package.json').version),
    },
    // root: './index.vite.html',
    // base: '',
    publicDir: PUBLIC_DIR,
    build: {
      outDir: BUILD_DIR,
      minify: false,
      assetsInlineLimit: 0,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: {
          main: path.join(__dirname, 'index.html'),
          cordova: path.join(__dirname, 'index.cordova.html'),
        },
        plugins: [
          // dynamicImportVars(),
        ],
      },
      // commonjsOptions: {
      //   strictRequires: 'auto',
      //   // dynamicRequirePaths: [
      //   //   'node_modules/typeorm/*.js',
      //   // ],
      //   // include: ['typeorm'],
      // },
    },
    optimizeDeps: {
      exclude: ['test'],
      // esbuildOptions: {
      //   plugins: [
      //     esbuildCommonjs(['typeorm', 'typeorm/browser']),
      //   ],
      // },
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm.js',
        '@': SRC_DIR,
        './images/layers.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers.png'),
        './images/layers-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers-2x.png'),
        './images/marker-icon.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon.png'),
        './images/marker-icon-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon-2x.png'),
        './images/marker-shadow.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-shadow.png'),
      },
      extensions: ['.vite.ts', '.vite.js', '.esnext.tx', '.esnext.js', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    // assetsInclude: ['./static/**/*'],
    // server: {
    //   host: true,
    // },
    // esbuild: {
    //   jsxFactory: '$jsx',
    //   jsxFragment: '"Fragment"',
    // },
  }
  if (isCordova) {
    config.base = './'
    config.resolve.alias.typeorm = 'typeorm/browser'
    config.resolve.extensions = ['.cordova.ts', '.cordova.js', '.mobile.js', '.mobile.ts'].concat(config.resolve.extensions)
  } else {
    config.resolve.alias.typeorm = 'nop-typeorm'
    // config.resolve.alias.push({ find: /typeorm$/, replacement: path.resolve(__dirname, './src/typeorm/nop.ts') })
    config.resolve.extensions = ['.web.ts', '.web.js', '.browser.ts', '.browser.js'].concat(config.resolve.extensions)
  }
  return config
})
