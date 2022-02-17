
import path from 'path';
import { defineConfig } from 'vite'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { createVuePlugin } from 'vite-plugin-vue2'
// import { injectHtml } from 'vite-plugin-html'

process.env.TARGET = process.env.TARGET || 'web'
const isCordova = process.env.TARGET === 'cordova'

const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public')
const BUILD_DIR = path.resolve(__dirname, './www')

export default defineConfig(({ command, mode }) => {
  const base = {
    plugins: [
      createVuePlugin({
        // target: 'es5',
      }),
      viteExternalsPlugin({
        'config': './static/config.js',
      }),
      // injectHtml({
      //   injectData: {
      //     'process.env': process.env,
      //     TARGET: process.env.TARGET,
      //     IS_CORDOVA: isCordova,
      //   },
      // }),
    ],
    // root: SRC_DIR,
    // base: '',
    // publicDir: PUBLIC_DIR,
    // build: {
    //   outDir: BUILD_DIR,
    //   assetsInlineLimit: 0,
    //   emptyOutDir: true,
    // },
    resolve: {
      alias: {
        '@': SRC_DIR,
        // Stupid leaflet CSS import workaround. Might be fixed in newer versions of leaflet, but I'm not opening that can of worms.
        './images/layers.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers.png'),
        './images/layers-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/layers-2x.png'),
        './images/marker-icon.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon.png'),
        './images/marker-icon-2x.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-icon-2x.png'),
        './images/marker-shadow.png$': path.resolve(__dirname, '../node_modules/leaflet/dist/images/marker-shadow.png')
      },
    },
    // server: {
    //   host: true,
    // },
    // esbuild: {
    //   jsxFactory: '$jsx',
    //   jsxFragment: '"Fragment"',
    // },
  }
  // TODO: customize imports based on the command
  return base
})