
import path from 'path';
import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { createVuePlugin } from 'vite-plugin-vue2'
import mdPlugin, { Mode } from 'vite-plugin-markdown'
// import { VuetifyResolver } from 'unplugin-vue-components/resolvers';
// import Components from 'unplugin-vue-components/vite';
import inlineImportPlugin from 'esbuild-plugin-inline-import'
// import { esbuildDecorators } from '@anatine/esbuild-decorators'
// import { injectHtml } from 'vite-plugin-html'

process.env.TARGET = process.env.TARGET || 'web'
const isCordova = process.env.TARGET === 'cordova'

const resolve = (p) => path.resolve(__dirname, p)
const SRC_DIR = resolve('./src')
const PUBLIC_DIR = resolve('./static')
const BUILD_DIR = resolve('./www')

export default defineConfig(({ command, mode }) => {
  console.log(`command: ${command}, mode: ${mode}, target: ${process.env.TARGET}`)
  const config = {
    plugins: [
      {
        ...inlineImportPlugin({
          filter: /\.md$/,
        }),
        enforce: 'pre',
      },
      createVuePlugin({
        // target: 'es5',
      }),
      viteExternalsPlugin({
        'config': 'config',
      }),
      mdPlugin({ mode: Mode.VUE }),
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
    publicDir: PUBLIC_DIR,
    build: {
      outDir: BUILD_DIR,
      assetsInlineLimit: 0,
      emptyOutDir: true,
      sourcemap: true,
    },
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
      extensions: ['.vite.ts', '.vite.js', '.esnext.tx', '.esnext.js', '.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
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
    config.resolve.extensions = ['.web.ts', '.browser.ts'].concat(config.resolve.extensions)
  }
  // TODO: customize imports based on the command
  return config
})