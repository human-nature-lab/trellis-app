
import path from 'path';
import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { createVuePlugin } from 'vite-plugin-vue2'
import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
// import { esbuildDecorators } from '@anatine/esbuild-decorators'
// import { injectHtml } from 'vite-plugin-html'

process.env.TARGET = process.env.TARGET || 'web'
const isCordova = process.env.TARGET === 'cordova'

const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public')
const BUILD_DIR = path.resolve(__dirname, './www')

export default defineConfig(({ command, mode }) => {
  console.log(`command: ${command}, mode: ${mode}, target: ${process.env.TARGET}`)
  const config = {
    plugins: [
      createVuePlugin({
        // target: 'es5',
      }),
      viteExternalsPlugin({
        'config': 'config',
      }),
      Components({
        // generate `components.d.ts` global declarations
        dts: true,
        
        // auto import for directives
        directives: false,
        // resolvers for custom components
        resolvers: [
          // Vuetify
          VuetifyResolver(),
        ],
      }),
    ],
    define: {
      'process.env': {
        APP_ENV: process.env.APP_ENV,
        TARGET: process.env.TARGET,
      },
      VERSION: JSON.stringify(require('./package.json').version),
    },
    // root: SRC_DIR,
    // base: '',
    publicDir: 'static',
    // build: {
    //   outDir: BUILD_DIR,
    //   assetsInlineLimit: 0,
    //   emptyOutDir: true,
    // },
    resolve: {
      alias: {
        'vue': 'vue/dist/vue.esm.js',
        '@': SRC_DIR,
        './images/layers.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers.png'),
        './images/layers-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers-2x.png'),
        './images/marker-icon.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon.png'),
        './images/marker-icon-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon-2x.png'),
        './images/marker-shadow.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-shadow.png')
      },
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
  if (process.env.TARGET === 'web') {
    config.resolve.alias['typeorm'] = 'nop-typeorm'
    // config.resolve.alias.push({ find: /typeorm$/, replacement: path.resolve(__dirname, './src/typeorm/nop.ts') })
    config.resolve.extensions = ['.web.ts', '.browser.ts', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  }
  // TODO: customize imports based on the command
  return config
})